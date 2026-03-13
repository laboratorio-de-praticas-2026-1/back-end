import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
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
    const [usuario, veiculo, servico] = await Promise.all([
      this.usuarioModel.findByPk(solicitacaoDto.usuario_id),
      this.veiculoModel.findByPk(solicitacaoDto.veiculo_id),
      this.servicoModel.findByPk(solicitacaoDto.servico_id),
    ]);

    if (!usuario) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    if (!veiculo) {
      throw new NotFoundException('Veiculo nao encontrado');
    }

    if (!servico) {
      throw new NotFoundException('Servico nao encontrado');
    }

    if (veiculo.usuarioId !== usuario.id) {
      throw new BadRequestException(
        'O veiculo informado nao pertence ao usuario',
      );
    }

    const solicitacao = await this.solicitacaoModel.create({
      usuarioId: usuario.id,
      veiculoId: veiculo.id,
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
}
