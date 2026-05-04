import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { StatusSolicitacaoEnum } from 'src/commons/enums/status-solicitacao.enum';
import { StatusValidacaoEnum } from 'src/commons/enums/status-validacao.enum';
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
import {
  ListSolicitacoesQueryDto,
  SOLICITACAO_ORDER_BY_COLUMN,
} from './dto/list-solicitacoes-query.dto';
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
    usuarioId: number,
  ): Promise<CreateSolicitacaoResponseDto> {
    const [usuario, servico] = await Promise.all([
      this.usuarioModel.findByPk(usuarioId),
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
          try {
            await this.dispararEmailStatus(
              solicitacao,
              textos.assunto,
              textos.titulo,
              textos.mensagem,
              textos.cor,
              observacao,
            );
          } catch (error) {
            new Logger(SolicitacaoService.name).error(
              `Falha ao enviar e-mail de atualização de status da solicitação ${id}. Status anterior: ${statusAnterior}. Novo status: ${novoStatus}.`,
              error instanceof Error ? error.stack : undefined,
            );
          }
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
        'Solicitação já está cancelada ou não pode ser cancelada',
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
      throw new ConflictException('Solicitação não está cancelada');
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

  async listarSolicitacoes(
    filtros: ListSolicitacoesQueryDto = new ListSolicitacoesQueryDto(),
  ): Promise<ListSolicitacoesResponseDto> {
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 10;
    const orderBy = filtros.orderBy ?? 'dataSolicitacao';
    const order = filtros.order ?? 'desc';
    const offset = (page - 1) * limit;

    const whereSolicitacao: Record<string, unknown> = {};
    const whereUsuario: Record<string, unknown> = {};

    if (filtros.usuario_id) {
      whereSolicitacao.usuarioId = filtros.usuario_id;
    }

    if (filtros.servico_id) {
      whereSolicitacao.servicoId = filtros.servico_id;
    }

    if (filtros.veiculo_id) {
      whereSolicitacao.veiculoId = filtros.veiculo_id;
    }

    if (filtros.status_in && filtros.status_in.length > 0) {
      whereSolicitacao.status = { [Op.in]: filtros.status_in };
    }

    const dataSolicitacaoFiltro: Record<symbol, Date> = {};
    if (filtros.data_solicitacao_inicio) {
      dataSolicitacaoFiltro[Op.gte] = new Date(filtros.data_solicitacao_inicio);
    }
    if (filtros.data_solicitacao_fim) {
      dataSolicitacaoFiltro[Op.lte] = this.normalizarDataFim(
        filtros.data_solicitacao_fim,
      );
    }
    if (Reflect.ownKeys(dataSolicitacaoFiltro).length > 0) {
      whereSolicitacao.dataSolicitacao = dataSolicitacaoFiltro;
    }

    const dataConclusaoFiltro: Record<symbol, Date | null> = {};
    if (filtros.data_conclusao_inicio) {
      dataConclusaoFiltro[Op.gte] = new Date(filtros.data_conclusao_inicio);
    }
    if (filtros.data_conclusao_fim) {
      dataConclusaoFiltro[Op.lte] = this.normalizarDataFim(
        filtros.data_conclusao_fim,
      );
    }
    if (filtros.concluida === true) {
      dataConclusaoFiltro[Op.not] = null;
    }

    if (filtros.concluida === false) {
      whereSolicitacao.dataConclusao = { [Op.is]: null };
    } else if (Reflect.ownKeys(dataConclusaoFiltro).length > 0) {
      whereSolicitacao.dataConclusao = dataConclusaoFiltro;
    }

    if (filtros.nome) {
      whereUsuario.nome = { [Op.like]: `%${filtros.nome}%` };
    }

    if (filtros.cpf_cnpj) {
      whereUsuario.cpfCnpj = { [Op.like]: `%${filtros.cpf_cnpj}%` };
    }

    const { rows: solicitacoes, count: total } =
      await this.solicitacaoModel.findAndCountAll({
        where: whereSolicitacao,
        limit,
        offset,
        order: [
          [
            SOLICITACAO_ORDER_BY_COLUMN[orderBy],
            order.toUpperCase() as 'ASC' | 'DESC',
          ],
        ],
        include: [
          {
            model: Usuario,
            attributes: ['id', 'nome', 'email'],
            where:
              Object.keys(whereUsuario).length > 0 ? whereUsuario : undefined,
            required: Object.keys(whereUsuario).length > 0,
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
        valorBase: Number(solicitacao.servico.valorBase) || 0,
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

    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      solicitacoes: solicitacoesFormatadas,
    };
  }

  async getAllSolicitacoes(query: ListSolicitacoesQueryDto): Promise<any> {
    return this.listarSolicitacoes(query);
  }


  private normalizarDataFim(data: string): Date {
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return new Date(`${data}T23:59:59.999Z`);
    }

    return new Date(data);
  }

  async enviarDocumento(
    solicitacaoId: number,
    usuarioId: number,
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
    if (solicitacao.usuarioId !== usuarioId) {
      throw new ForbiddenException(
        'Você não tem permissão para enviar documentos nesta solicitação',
      );
    }

  let urlDocRestricted: CloudinaryResponse;

  try {
    urlDocRestricted =
      await this.cloudinaryService.uploadDocument(documento);
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

  const nomeHash = this.cryptoUtil.encrypt(
    `${resourceType}|${publicId}`,
  );

    await this.documentoModel.create({
      solicitacaoId: solicitacaoId,
      nomeHash: nomeHash,
      tipoDocumento: data.tipo_documento,
      dataUpload: new Date(),
      statusValidacao: StatusValidacaoEnum.PENDENTE,
    });
    return {
      message: 'Documento enviado com sucesso e aguardando validação.',
    };
  }


  async listarDocumentos(solicitacaoId: number): Promise<{
    data: {
      id: number;
      tipo_documento: string | null;
      nome_arquivo: string;
      status_validacao: StatusValidacaoEnum;
      url: string;
      data_upload: Date | null;
    }[];
    total: number;
    message?: string;
  }> {
    const solicitacao = await this.solicitacaoModel.findByPk(solicitacaoId);

    if (!solicitacao) {
      throw new NotFoundException({
        error: 'SOLICITACAO_NAO_ENCONTRADA',
        message: 'A solicitação não foi encontrada',
      });
    }

    const documentos = await this.documentoModel.findAll({
      where: { solicitacaoId },
    });

    if (!documentos.length) {
      return {
        data: [],
        total: 0,
        message: 'Nenhum documento encontrado para esta solicitação',
      };
    }

    const data = (
      await Promise.all(
        documentos.map(async (doc) => {
          try {
            if (!doc.nomeHash) {
              throw new Error('Documento sem nomeHash');
            }

            const decrypted = this.cryptoUtil.decrypt(doc.nomeHash);
            const [resourceType, publicId] = decrypted.split('|');

            if (!resourceType || !publicId) {
              throw new Error('Formato inválido');
            }

            const url = this.cloudinaryService.generateTemporaryUrl(decrypted);

            return {
              id: doc.id,
              tipo_documento: doc.tipoDocumento,
              nome_arquivo: doc.nomeOriginal ?? publicId,
              status_validacao: doc.statusValidacao,
              url,
              data_upload: doc.dataUpload,
            };
          } catch (error) {
            this.logger.warn(
              `Erro ao processar documento ID ${doc.id}: ${
                error instanceof Error ? error.message : 'Erro desconhecido'
              }`,
            );

            return null;
          }
        }),
      )
    ).filter(
      (
        item,
      ): item is {
        id: number;
        tipo_documento: string | null;
        nome_arquivo: string;
        status_validacao: StatusValidacaoEnum;
        url: string;
        data_upload: Date | null;
      } => item !== null,
    );

    if (!data.length) {
      return {
        data: [],
        total: 0,
        message: 'Nenhum documento encontrado para esta solicitação',
      };
    }

    return {
      data,
      total: data.length,
    };
  }

  async substituirDocumento(
    solicitacaoId: number,
    docId: number,
    arquivo: Express.Multer.File,
  ): Promise<{ id: number; mensagem: string }> {
    const solicitacao = await this.solicitacaoModel.findByPk(solicitacaoId);
    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    const documento = await this.documentoModel.findByPk(docId);
    if (!documento) {
      throw new NotFoundException('Documento não encontrado');
    }

    if (documento.solicitacaoId !== solicitacaoId) {
      throw new BadRequestException(
        'Documento não pertence à solicitação informada',
      );
    }

    if (documento.nomeHash) {
      void (async () => {
        try {
          const decryptedHash = this.cryptoUtil.decrypt(documento.nomeHash!);
          await this.cloudinaryService.deleteDocument(decryptedHash);
        } catch (err) {
          this.logger.error(
            `Falha ao remover asset antigo do Cloudinary para doc ${docId}: ${
              err instanceof Error ? err.message : 'Erro desconhecido'
            }`,
          );
        }
      })();
    }

    let urlDocRestricted: CloudinaryResponse;

    try {
      urlDocRestricted = await this.cloudinaryService.uploadDocument(arquivo);
    } catch (error) {
      const mensagemErro =
        error instanceof Error ? error.message : 'Erro desconhecido';

      this.logger.error(
        `Falha ao enviar documento substituto para a solicitacao ${solicitacaoId}: ${mensagemErro}`,
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

    await documento.update({
      nomeHash: nomeHash,
      dataUpload: new Date(),
      statusValidacao: 'pendente',
    });

    return {
      id: documento.id,
      mensagem: 'Documento substituído com sucesso',
    };
  }

}
