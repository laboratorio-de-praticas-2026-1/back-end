import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { PerfilUsuarioDto } from './dto/recomendacao-perfil-usuario';
import { SolicitacaoComServico } from './dto/solicitacao-com-servico';

@Injectable()
export class RecomendacaoService {
  private readonly logger = new Logger(RecomendacaoService.name);

  constructor(
    @InjectModel(Servico)
    private servicoModel: typeof Servico,
    @InjectModel(Solicitacao)
    private solicitacaoModel: typeof Solicitacao,
  ) {}

  async buscarAtributosPerfil(usuarioId: number): Promise<PerfilUsuarioDto[]> {
    try {
      this.logger.log(`Buscando serviços do usuário com id ${usuarioId}`);

      const solicitacoes = (await this.solicitacaoModel.findAll({
        attributes: [],
        where: { usuarioId },
        include: [
          {
            model: this.servicoModel,
            attributes: ['nome', 'descricao', 'valor_base', 'ativo'],
            required: true,
          },
        ],
        raw: true,
        nest: true,
      })) as unknown as SolicitacaoComServico[];

      if (!solicitacoes || solicitacoes.length === 0) {
        this.logger.warn(`Nenhum serviço encontrado para usuário ${usuarioId}`);
        return [];
      }

      return solicitacoes.map((s: SolicitacaoComServico) => ({
        nome: s.servico.nome,
        descricao: s.servico.descricao,
        valor_base: s.servico.valor_base,
        ativo: s.servico.ativo,
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(
        `Erro ao buscar serviços para o usuário ${usuarioId}: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'Erro ao processar perfil de recomendação',
      );
    }
  }
}
