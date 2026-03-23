import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StatusSolicitacaoEnum } from 'src/commons/enums/status-solicitacao.enum';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { NotificacaoService } from '../notificacao/notificacao.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import {
  CreateSolicitacaoResponseDto,
  ProtocoloSolicitacaoDto,
} from './dto/create-solicitacao-response.dto';
import { UpdateSolicitacaoStatusDto } from './dto/update-solicitacao-status.dto';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { CreateDocumentoDto } from './dto/create-documento.dto';

@Injectable()
export class SolicitacaoService {
  private readonly logger: Logger = new Logger(SolicitacaoService.name);

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
  ) {}

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

    return {
      message: 'Agendamento de serviço realizado com sucesso',
      protocolo,
    };
  }

  async findSolicitacaoById(id: number): Promise<Solicitacao> {
    const solicitacao: Solicitacao | null =
      await this.solicitacaoModel.findByPk(id);

    if (!solicitacao) {
      throw new NotFoundException(`Solicitação com ID ${id} não encontrada`);
    }

    return solicitacao;
  }

  async updateSolicitacaoStatusById(
    id: number,
    updateSolicitacaoStatusDto: UpdateSolicitacaoStatusDto,
  ): Promise<{ message: string }> {
    const solicitacao: Solicitacao = await this.findSolicitacaoById(id);

    const updateData: Partial<Solicitacao> = {
      status: updateSolicitacaoStatusDto.status,
    };

    const observacao: string | undefined =
      updateSolicitacaoStatusDto.observacaoAdmin;
    if (observacao) {
      updateData.observacaoAdmin = observacao;
    }

    if (updateSolicitacaoStatusDto.status === StatusSolicitacaoEnum.CONCLUIDO) {
      updateData.dataConclusao = new Date();
    }

    await solicitacao.update(updateData);

    return {
      message: 'Status da solicitação atualizado com sucesso.',
    };
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

async enviarDocumento(
  solicitacaoId: number,
  data: CreateDocumentoDto,
    ): Promise<{ message: string }> {
  if (!data.tipo_documento || !data.url_criptografada) {
    throw new BadRequestException('Dados inválidos');
  }
  const solicitacao = await this.solicitacaoModel.findByPk(solicitacaoId);
  if (!solicitacao) {
    throw new NotFoundException('Solicitação não encontrada');
  }
  await this.documentoModel.create({
    solicitacaoId: solicitacaoId,
    nomeHash: data.url_criptografada,
    tipoDocumento: data.tipo_documento,
    dataUpload: new Date(),
    statusValidacao: 'pendente',
  });
  return {
    message: 'Documento enviado com sucesso e aguardando validação.',
  };
}
}
