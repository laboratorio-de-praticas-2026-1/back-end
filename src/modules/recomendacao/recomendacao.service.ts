import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InteracaoUsuario } from 'src/models/interacao-usuario.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { RecomendacaoInteracaoRequestDto } from './dto/recomendacao-interacao-request.dto';
import { RecomendacaoInteracaoResponseDto } from './dto/recomendacao-interacao-response.dto';
import { PerfilUsuarioDto } from './dto/recomendacao-perfil-usuario.dto';
import { SolicitacaoComServicoDto } from './dto/solicitacao-com-servico.dto';
import { Op, fn, col, literal } from 'sequelize';
import { Debito } from 'src/models/debito.model';
import { Veiculo } from 'src/models/veiculo.model';
import { RecomendacaoRespostaDto } from './dto/recomendacao-resposta.dto';

@Injectable()
export class RecomendacaoService {
  private readonly logger = new Logger(RecomendacaoService.name);

  constructor(
    @InjectModel(Servico)
    private servicoModel: typeof Servico,
    @InjectModel(Solicitacao)
    private solicitacaoModel: typeof Solicitacao,
    @InjectModel(InteracaoUsuario)
    private interacaoUsuarioModel: typeof InteracaoUsuario,
    @InjectModel(Debito)
    private debitoModel: typeof Debito,
  ) {}

  async obterRecomendacoes(usuarioId: number) {
    try {
      const proativo = await this.buscarRecursoMulta(usuarioId);
      if (proativo) {
        return [proativo];
      }

      const historico = await this.buscarAtributosPerfil(usuarioId);

      if (historico.length > 0) {
        const idsUsados = historico.map((s) => s.id);

        const servicos = await this.servicoModel.findAll({
          where: {
            ativo: true,
            id: { [Op.notIn]: idsUsados },
          },
        });

        return servicos.map((s) => ({
          id: s.id,
          nome: s.nome,
          descricao: s.descricao,
        }));
      }

      return await this.buscarServicosPopulares();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao gerar recomendações: ${errorMessage}`);
      throw new InternalServerErrorException('Erro ao processar recomendações');
    }
  }

  async buscarRecursoMulta(usuarioId: number): Promise<RecomendacaoRespostaDto | null> {
    try {
      const palavrasChave = ['multa', 'infração', 'infracao', 'autuação', 'autuacao', 'radar', 'transitar em velocidade'];

      const debitos = await this.debitoModel.findAll({
        where: {
          tipo: 'veiculo',
          status: 'pendente',
          [Op.or]: palavrasChave.map((p) => ({
            descricao: { [Op.like]: `%${p}%` },
          })),
        },
        include: [
          {
            model: Veiculo,
            where: { usuarioId },
            through: { attributes: [] },
            required: true,
          },
        ],
      });

      for (const debito of debitos) {
        for (const veiculo of debito.veiculos || []) {
          const jaExiste = await this.solicitacaoModel.findOne({
            where: {
              servicoId: 6,
              veiculoId: veiculo.id,
              status: {
                [Op.notIn]: ['concluido', 'cancelado'],
              },
            },
          });

          if (!jaExiste) {
            return {
              id: 6,
              nome: 'Recurso de Multa',
              descricao:
                'Identificamos uma multa pendente. Você tem o direito de recorrer e evitar pontos na sua CNH.',
              ativo: true
            };
          }
        }
      }
     
      return await this.buscarParcelamentoDebitos(usuarioId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';

      this.logger.error(`Erro na busca proativa de multas: ${errorMessage}`);

      return await this.buscarParcelamentoDebitos(usuarioId);
    }
  }

  private async buscarParcelamentoDebitos(usuarioId: number) {
    this.logger.log(
      `Seguindo para nível de parcelamento para usuário ${usuarioId}`,
    );
    return Promise.resolve(null);
  }

  private async buscarServicosPopulares() {
    const populares = (await this.solicitacaoModel.findAll({
      attributes: [
        'servico_id',
        [fn('COUNT', col('servico_id')), 'quantidade'],
      ],
      group: ['servico_id'],
      order: [[literal('quantidade'), 'DESC']],
      limit: 5,
      include: [
        {
          model: this.servicoModel,
          attributes: ['id', 'nome', 'descricao'],
          where: { ativo: true },
        },
      ],
    })) as unknown as Array<{
      servico: Pick<Servico, 'id' | 'nome' | 'descricao'>;
    }>;

    return populares.map((p) => ({
      id: p.servico.id,
      nome: p.servico.nome,
      descricao: p.servico.descricao,
    }));
  }

  async buscarAtributosPerfil(usuarioId: number): Promise<PerfilUsuarioDto[]> {
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

    if (!solicitacoes || solicitacoes.length === 0) return [];

    return solicitacoes.map((s) => ({
      id: s.servico.id,
      nome: s.servico.nome,
      descricao: s.servico.descricao,
      valor_base: s.servico.valor_base,
      ativo: s.servico.ativo,
    }));
  }

  async criarInteracao(
    usuarioId: number,
    interacaoDto: RecomendacaoInteracaoRequestDto,
  ): Promise<RecomendacaoInteracaoResponseDto> {
    const interacao = await this.interacaoUsuarioModel.create({
      usuarioId,
      categoriaBlog: interacaoDto.categoriaBlog,
      dataInteracao: interacaoDto.dataInteracao,
    });

    return {
      id: interacao.id,
      usuarioId,
      categoriaBlog: interacao.categoriaBlog,
      dataInteracao: String(interacao.dataInteracao),
    };
  }
}
