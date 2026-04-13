import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { PerfilUsuarioDto } from './dto/recomendacao-perfil-usuario.dto';
import { SolicitacaoComServicoDto } from './dto/solicitacao-com-servico.dto';
import { Op, fn, col, literal } from 'sequelize';

@Injectable()
export class RecomendacaoService {
  private readonly logger = new Logger(RecomendacaoService.name);

  constructor(
    @InjectModel(Servico)
    private servicoModel: typeof Servico,
    @InjectModel(Solicitacao)
    private solicitacaoModel: typeof Solicitacao,
  ) {}

  async obterRecomendacoes(usuarioId: number) {
    try {
      const historico = await this.buscarAtributosPerfil(usuarioId);

      if (historico.length > 0) {
        const idsUsados  = historico.map(s => s.id);
        
        const servicos = await this.servicoModel.findAll({
          where: {
            ativo: true,
            id: { [Op.notIn]: idsUsados }
          }
        });

        return servicos.map(s => ({
          id: s.id,
          nome: s.nome,
          descricao: s.descricao,
        }));
      }

      return await this.buscarServicosPopulares();

    } catch (error) {
      this.logger.error(`Erro ao gerar recomendações: ${error.message}`);
      throw new InternalServerErrorException('Erro no processar recomendações');
    }
  }

  private async buscarServicosPopulares() {
    const populares = await this.solicitacaoModel.findAll({
      attributes: [
        'servico_id',
        [fn('COUNT', col('servico_id')), 'quantidade']
      ],
      group: ['servico_id'],
      order: [[literal('quantidade'), 'DESC']],
      limit: 5,
      include: [{ model: this.servicoModel, where: { ativo: true } }],
    });

    return populares.map(p => {
      const servico = (p as any).servico;

      return {
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
      };
    });
  }

  async buscarAtributosPerfil(usuarioId: number): Promise<PerfilUsuarioDto[]> {
    try {
      this.logger.log(`Buscando serviços do usuário com id ${usuarioId}`);

      const solicitacoes = (await this.solicitacaoModel.findAll({
        attributes: [],
        where: { usuarioId },
        include: [
          {
            model: this.servicoModel,
            attributes: ['id', 'nome', 'descricao', 'valor_base', 'ativo'],
            required: true,
          },
        ],
        raw: true,
        nest: true,
      })) as unknown as SolicitacaoComServicoDto[];

      if (!solicitacoes || solicitacoes.length === 0) {
        this.logger.warn(`Nenhum serviço encontrado para usuário ${usuarioId}`);
        return [];
      }

      return solicitacoes.map((s: SolicitacaoComServicoDto) => ({
        id: s.servico.id,
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
