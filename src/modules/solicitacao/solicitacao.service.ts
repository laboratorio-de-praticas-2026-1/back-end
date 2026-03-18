import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UpdateSolicitacaoStatusDto } from './dto/update-solicitacao-status.dto';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { NotificacaoService } from '../notificacao/notificacao.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';

@Injectable()
export class SolicitacaoService {
  constructor(
    @InjectModel(Solicitacao)
    private readonly solicitacaoModel: typeof Solicitacao,
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
  ): Promise<{ message: string }> {
    const [usuario, servico] = await Promise.all([
      this.usuarioModel.findByPk(solicitacaoDto.usuario_id),
      this.servicoModel.findByPk(solicitacaoDto.servico_id),
    ]);

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    if (!servico) {
      throw new NotFoundException('Servico nao encontrado');
    }

    const veiculo: Veiculo | null = solicitacaoDto.veiculo_id
      ? await this.veiculoModel.findByPk(solicitacaoDto.veiculo_id)
      : null;

    if (solicitacaoDto.veiculo_id && !veiculo) {
      throw new NotFoundException('Veiculo nao encontrado');
    }

    if (veiculo && veiculo.usuarioId !== usuario.id) {
      throw new BadRequestException(
        'O veiculo informado nao pertence ao usuario',
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

    await this.notificacaoService.enviarConfirmacaoSolicitacao({
      email: usuario.email,
      nomeUsuario: usuario.nome,
      solicitacaoId: solicitacao.id,
      servicoNome: servico.nome,
    });

    return {
      message: 'Solicitação de serviço criada com sucesso',
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

  async updateSolicitacaoStatus(
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

    if (updateSolicitacaoStatusDto.status === 'concluido') {
      updateData.dataConclusao = new Date();
    }

    await solicitacao.update(updateData);

    return {
      message: 'Status da solicitação atualizado com sucesso.',
    };
  }
}
