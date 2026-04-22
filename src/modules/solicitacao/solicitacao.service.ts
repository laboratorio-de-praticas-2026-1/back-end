import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StatusSolicitacaoEnum } from 'src/commons/enums/status-solicitacao.enum';
import { CryptoUtil } from 'src/commons/utils/crypto';
import { CloudinaryService } from 'src/infra/cloudinary/cloudinary.service';
import { CloudinaryResponse } from 'src/infra/cloudinary/dto/cloudinary-response';
import { EmailService } from 'src/infra/email/email.service';
import { EmailParams } from 'src/infra/email/dto/email-params';
import {
  STATUS_UPDATE,
  SOLICITACAO_FEITA,
} from 'src/infra/email/templates/templates-names';
import { obterTextosEmailPorStatus } from 'src/infra/email/status-email-textos';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { NotificacaoService } from '../notificacao/notificacao.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import {
  CreateSolicitacaoResponseDto,
  ProtocoloSolicitacaoDto,
} from './dto/create-solicitacao-response.dto';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { GetSolicitacaoResponseDto } from './dto/get-solicitacao-response.dto';
import { ListSolicitacoesResponseDto } from './dto/list-solicitacoes-response.dto';
import { UpdateSolicitacaoStatusDto } from './dto/update-solicitacao-status.dto';

@Injectable()
export class SolicitacaoService implements OnModuleDestroy {
  private readonly logger: Logger = new Logger(SolicitacaoService.name);

  private readonly emailDebounceMap = new Map<string, number>();
  private readonly DEBOUNCE_INTERVAL_MS = 3 * 60 * 1000;
  private readonly debounceCleanupTimer: ReturnType<typeof setInterval>;

  private readonly STATUS_COM_EMAIL = new Set<string>([
    StatusSolicitacaoEnum.AGUARDANDO_PAGAMENTO,
    StatusSolicitacaoEnum.AGUARDANDO_DOCUMENTO,
    StatusSolicitacaoEnum.CONCLUIDO,
    StatusSolicitacaoEnum.CANCELADO,
  ]);

  constructor(
    @InjectModel(Solicitacao)
    private readonly solicitacaoModel: typeof Solicitacao,
    @InjectModel(DocumentoSolicitacao)
    private readonly documentoModel: typeof DocumentoSolicitacao,
    @InjectModel(Usuario)
    private readonly usuarioModel: typeof Usuario,
    @InjectModel(Veiculo)
    private readonly veiculoModel: typeof Veiculo,
    @InjectModel(Servico)
    private readonly servicoModel: typeof Servico,
    private readonly notificacaoService: NotificacaoService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cryptoUtil: CryptoUtil,
    private readonly emailService: EmailService,
  ) {
    this.debounceCleanupTimer = setInterval(() => {
      this.limparEntradasExpiradas();
    }, this.DEBOUNCE_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    clearInterval(this.debounceCleanupTimer);
  }

  private limparEntradasExpiradas(): void {
    const agora = Date.now();
    let removidas = 0;

    for (const [chave, timestamp] of this.emailDebounceMap) {
      if (agora - timestamp >= this.DEBOUNCE_INTERVAL_MS) {
        this.emailDebounceMap.delete(chave);
        removidas++;
      }
    }

    if (removidas > 0) {
      this.logger.debug(
        `Debounce cleanup: ${removidas} entrada(s) expirada(s) removida(s), ${this.emailDebounceMap.size} restante(s)`,
      );
    }
  }

  async criarSolicitacao(
    solicitacaoDto: CreateSolicitacaoDto,
  ): Promise<CreateSolicitacaoResponseDto> {
    const [usuario, servico] = await Promise.all([
      this.usuarioModel.findByPk(solicitacaoDto.usuario_id),
      this.servicoModel.findByPk(solicitacaoDto.servico_id),
    ]);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!servico) {
      throw new NotFoundException('Serviço não encontrado');
    }

    const veiculo: Veiculo | null = solicitacaoDto.veiculo_id
      ? await this.veiculoModel.findByPk(solicitacaoDto.veiculo_id)
      : null;

    if (solicitacaoDto.veiculo_id && !veiculo) {
      throw new NotFoundException('Veículo não encontrado');
    }

    if (veiculo && veiculo.usuarioId !== usuario.id) {
      throw new BadRequestException(
        'O veículo informado não pertence ao usuário',
      );
    }

    const solicitacao: Solicitacao = await this.solicitacaoModel.create({
      usuarioId: usuario.id,
      veiculoId: veiculo?.id ?? null,
      servicoId: servico.id,
      observacaoCliente: solicitacaoDto.observacao_cliente ?? null,
      status: 'recebido',
      dataSolicitacao: new Date(),
    });

    const protocolo: ProtocoloSolicitacaoDto = this.gerarProtocoloSolicitacao(
      usuario,
      servico,
      solicitacao,
    );

    void this.notificacaoService
      .enviarConfirmacaoSolicitacao({
        email: usuario.email,
        nomeUsuario: usuario.nome,
        solicitacaoId: solicitacao.id,
        protocolo,
      })
      .catch((error: unknown) => {
        const mensagemErro =
          error instanceof Error ? error.message : 'Erro desconhecido';
        this.logger.warn(
          `Falha ao enviar email de confirmacao da solicitacao ${solicitacao.id}: ${mensagemErro}`,
        );
      });

    void this.emailService
      .enviarEmail(
        new EmailParams(
          usuario.email,
          SOLICITACAO_FEITA,
          `Solicitação recebida - Solicitação #${solicitacao.id}`,
          {
            nomeCliente: usuario.nome,
            solicitacaoId: solicitacao.id,
            servicoNome: servico.nome,
          },
        ),
      )
      .catch((error: unknown) => {
        const mensagemErro =
          error instanceof Error ? error.message : 'Erro desconhecido';
        this.logger.warn(
          `Falha ao enviar email de solicitacao feita ${solicitacao.id}: ${mensagemErro}`,
        );
      });

    return {
      message: 'Agendamento de serviço realizado com sucesso',
      protocolo,
    };
  }

  async findSolicitacaoById(id: number): Promise<Solicitacao> {
    const solicitacao: Solicitacao | null =
      await this.solicitacaoModel.findByPk(id, {
        include: [
          { model: Usuario, attributes: ['id', 'nome', 'email'] },
          { model: Servico, attributes: ['id', 'nome'] },
        ],
      });

    if (!solicitacao) {
      throw new NotFoundException(`Solicitação com ID ${id} não encontrada`);
    }

    return solicitacao;
  }

  async getSolicitacaoById(id: number): Promise<GetSolicitacaoResponseDto> {
    const solicitacao: Solicitacao | null =
      await this.solicitacaoModel.findByPk(id, {
        include: [
          {
            model: Usuario,
            attributes: ['id', 'nome', 'cpfCnpj'],
          },
          {
            model: Veiculo,
            attributes: ['id', 'modelo', 'placa'],
          },
          {
            model: Servico,
            attributes: ['id', 'nome'],
          },
        ],
      });

    if (!solicitacao) {
      throw new NotFoundException({
        error: 'SOLICITACAO_NAO_ENCONTRADA',
        message: 'A solicitação não foi encontrada',
      });
    }

    return {
      id: solicitacao.id,
      usuario_id: solicitacao.usuarioId,
      veiculo_id: solicitacao.veiculoId,
      servico_id: solicitacao.servicoId,
      status: solicitacao.status,
      observacao_cliente: solicitacao.observacaoCliente,
      observacao_admin: solicitacao.observacaoAdmin,
      data_solicitacao: solicitacao.dataSolicitacao.toISOString(),
      data_conclusao: solicitacao.dataConclusao
        ? solicitacao.dataConclusao.toISOString()
        : null,
      usuario: {
        id: solicitacao.usuario.id,
        nome: solicitacao.usuario.nome,
        cpf_cnpj: solicitacao.usuario.cpfCnpj ?? null,
      },
      veiculo: solicitacao.veiculo
        ? {
            id: solicitacao.veiculo.id,
            modelo: solicitacao.veiculo.modelo,
            placa: solicitacao.veiculo.placa,
          }
        : null,
      servico: {
        id: solicitacao.servico.id,
        nome: solicitacao.servico.nome,
      },
    };
  }

  async updateSolicitacaoStatusById(
    id: number,
    updateSolicitacaoStatusDto: UpdateSolicitacaoStatusDto,
  ): Promise<{ message: string }> {
    const solicitacao: Solicitacao = await this.findSolicitacaoById(id);

    const statusAnterior = solicitacao.status as StatusSolicitacaoEnum;
    const novoStatus = updateSolicitacaoStatusDto.status;

    const updateData: Partial<Solicitacao> = {
      status: novoStatus,
    };

    const observacao: string | undefined =
      updateSolicitacaoStatusDto.observacaoAdmin;
    if (observacao) {
      updateData.observacaoAdmin = observacao;
    }

    if (novoStatus === StatusSolicitacaoEnum.CONCLUIDO) {
      updateData.dataConclusao = new Date();
    }

    await solicitacao.update(updateData);

    if (this.deveDispararEmail(statusAnterior, novoStatus)) {
      if (this.verificarDebounce(id, novoStatus, statusAnterior)) {
        const isReabertura =
          statusAnterior === StatusSolicitacaoEnum.CANCELADO &&
          novoStatus === StatusSolicitacaoEnum.EM_ANDAMENTO;

        const textos = obterTextosEmailPorStatus(novoStatus, isReabertura);

        if (textos) {
          void this.dispararEmailStatus(
            solicitacao,
            textos.assunto,
            textos.titulo,
            textos.mensagem,
            textos.cor,
            observacao,
          ).catch((error: unknown) => {
            const mensagemErro =
              error instanceof Error ? error.message : 'Erro desconhecido';
            this.logger.warn(
              `Falha ao enviar email de status para solicitacao ${id}: ${mensagemErro}`,
            );
          });
        }
      }
    }

    return {
      message: 'Status da solicitação atualizado com sucesso.',
    };
  }

  async cancelarSolicitacao(
    id: number,
  ): Promise<{ id: number; status: StatusSolicitacaoEnum.CANCELADO }> {
    const solicitacao = await this.findSolicitacaoById(id);
    const statusAtual = solicitacao.status as StatusSolicitacaoEnum;

    if (
      statusAtual === StatusSolicitacaoEnum.CANCELADO ||
      statusAtual === StatusSolicitacaoEnum.CONCLUIDO
    ) {
      throw new ConflictException(
        'SolicitaÃ§Ã£o jÃ¡ estÃ¡ cancelada ou nÃ£o pode ser cancelada',
      );
    }

    await this.updateSolicitacaoStatusById(id, {
      status: StatusSolicitacaoEnum.CANCELADO,
    });

    return {
      id,
      status: StatusSolicitacaoEnum.CANCELADO,
    };
  }

  async reabrirSolicitacao(
    id: number,
  ): Promise<{ id: number; status: StatusSolicitacaoEnum.EM_ANDAMENTO }> {
    const solicitacao = await this.findSolicitacaoById(id);
    const statusAtual = solicitacao.status as StatusSolicitacaoEnum;

    if (statusAtual !== StatusSolicitacaoEnum.CANCELADO) {
      throw new ConflictException('SolicitaÃ§Ã£o nÃ£o estÃ¡ cancelada');
    }

    await this.updateSolicitacaoStatusById(id, {
      status: StatusSolicitacaoEnum.EM_ANDAMENTO,
    });

    return {
      id,
      status: StatusSolicitacaoEnum.EM_ANDAMENTO,
    };
  }

  private deveDispararEmail(
    statusAnterior: StatusSolicitacaoEnum,
    novoStatus: StatusSolicitacaoEnum,
  ): boolean {
    if (statusAnterior === novoStatus) return false;

    if (this.STATUS_COM_EMAIL.has(novoStatus)) return true;

    if (
      statusAnterior === StatusSolicitacaoEnum.CANCELADO &&
      novoStatus === StatusSolicitacaoEnum.EM_ANDAMENTO
    ) {
      return true;
    }

    return false;
  }

  private verificarDebounce(
    solicitacaoId: number,
    novoStatus: string,
    statusAnterior: string,
  ): boolean {
    const chave = `${solicitacaoId}:${statusAnterior}:${novoStatus}`;
    const agora = Date.now();
    const ultimoEnvio = this.emailDebounceMap.get(chave);

    if (ultimoEnvio && agora - ultimoEnvio < this.DEBOUNCE_INTERVAL_MS) {
      this.logger.log(
        `Debounce ativo para solicitacao ${solicitacaoId}: ${statusAnterior} -> ${novoStatus}`,
      );
      return false;
    }

    this.emailDebounceMap.set(chave, agora);
    return true;
  }

  private async dispararEmailStatus(
    solicitacao: Solicitacao,
    assunto: string,
    titulo: string,
    mensagem: string,
    statusCor: string,
    observacaoAdmin?: string,
  ): Promise<void> {
    const emailDestinatario = solicitacao.usuario?.email;
    const nomeCliente = solicitacao.usuario?.nome;
    const servicoNome = solicitacao.servico?.nome;

    if (!emailDestinatario || !nomeCliente) {
      this.logger.warn(
        `Dados do usuario incompletos para solicitacao ${solicitacao.id}`,
      );
      return;
    }

    const params = new EmailParams(
      emailDestinatario,
      STATUS_UPDATE,
      `${assunto} - Solicitação #${solicitacao.id}`,
      {
        nomeCliente,
        solicitacaoId: solicitacao.id,
        servicoNome: servicoNome || 'Serviço',
        titulo,
        mensagem,
        statusCor,
        observacaoAdmin: observacaoAdmin || '',
      },
    );

    await this.emailService.enviarEmail(params);

    this.logger.log(
      `Email de status enviado para ${emailDestinatario} (solicitacao #${solicitacao.id})`,
    );
  }

  private gerarProtocoloSolicitacao(
    usuario: Usuario,
    servico: Servico,
    solicitacao: Solicitacao,
  ): ProtocoloSolicitacaoDto {
    const dataSolicitacao = solicitacao.dataSolicitacao ?? new Date();
    const prazoEstimadoDias = servico.prazoEstimadoDias ?? 0;
    const prazoEstimado = new Date(dataSolicitacao);

    prazoEstimado.setDate(prazoEstimado.getDate() + prazoEstimadoDias);

    return {
      cliente: {
        nome: usuario.nome,
      },
      servico: {
        nome: servico.nome,
        valor_base:
          servico.valorBase !== null && servico.valorBase !== undefined
            ? Number(servico.valorBase)
            : null,
      },
      solicitacao: {
        data_solicitacao: this.formatarData(dataSolicitacao),
        prazo_estimado: this.formatarData(prazoEstimado),
      },
    };
  }

  private formatarData(data: Date): string {
    return data.toISOString().slice(0, 10);
  }

  async listarSolicitacoes(): Promise<ListSolicitacoesResponseDto> {
    const solicitacoes = await this.solicitacaoModel.findAll({
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nome', 'email'],
        },
        {
          model: Servico,
          attributes: ['id', 'nome', 'valorBase'],
        },
      ],
    });

    const solicitacoesFormatadas = solicitacoes.map((solicitacao) => ({
      cliente: {
        id: solicitacao.usuario.id,
        nome: solicitacao.usuario.nome,
        email: solicitacao.usuario.email,
      },
      servico: {
        id: solicitacao.servico.id,
        tipo: solicitacao.servico.nome,
        valorBase: solicitacao.servico.valorBase || 0,
      },
      solicitacao: {
        status:
          solicitacao.status.charAt(0).toUpperCase() +
          solicitacao.status.slice(1),
        observacaoCliente: solicitacao.observacaoCliente || '',
        observacaoAdmin: solicitacao.observacaoAdmin || '',
        dataSolicitacao: solicitacao.dataSolicitacao,
        dataConclusao: solicitacao.dataConclusao,
      },
    }));

    return {
      total: solicitacoes.length,
      solicitacoes: solicitacoesFormatadas,
    };
  }

  async enviarDocumento(
    solicitacaoId: number,
    data: CreateDocumentoDto,
    documento: Express.Multer.File,
  ): Promise<{ message: string }> {
    if (!data.tipo_documento) {
      throw new BadRequestException('Dados inválidos');
    }
    const solicitacao = await this.solicitacaoModel.findByPk(solicitacaoId);
    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    let urlDocRestricted: CloudinaryResponse;

    try {
      urlDocRestricted = await this.cloudinaryService.uploadDocument(documento);
    } catch (error) {
      const mensagemErro =
        error instanceof Error ? error.message : 'Erro desconhecido';

      this.logger.error(
        `Falha ao enviar documento para a solicitacao ${solicitacaoId}: ${mensagemErro}`,
      );

      throw new BadRequestException(
        `Erro ao enviar documento: ${mensagemErro}`,
      );
    }

    const publicId = urlDocRestricted.public_id as string;
    if (!publicId) {
      throw new InternalServerErrorException(
        'Resposta inválida do Cloudinary: public_id ausente',
      );
    }
    const resourceType = urlDocRestricted.resource_type as 'raw' | 'image';
    const nomeHash = this.cryptoUtil.encrypt(`${resourceType}|${publicId}`);

    await this.documentoModel.create({
      solicitacaoId: solicitacaoId,
      nomeHash: nomeHash,
      tipoDocumento: data.tipo_documento,
      dataUpload: new Date(),
      statusValidacao: 'pendente',
    });
    return {
      message: 'Documento enviado com sucesso e aguardando validação.',
    };
  }
}
