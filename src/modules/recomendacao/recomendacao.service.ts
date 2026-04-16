import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InteracaoUsuario } from 'src/models/interacao-usuario.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Veiculo } from 'src/models/veiculo.model';
import { RecomendacaoInteracaoRequestDto } from './dto/recomendacao-interacao-request.dto';
import { RecomendacaoInteracaoResponseDto } from './dto/recomendacao-interacao-response.dto';
import { PerfilUsuarioDto } from './dto/recomendacao-perfil-usuario.dto';
import { SolicitacaoComServicoDto } from './dto/solicitacao-com-servico.dto';
import { Op, fn, col, literal } from 'sequelize';
import { plainToClass } from 'class-transformer';
import { markAsUncloneable } from 'worker_threads';

@Injectable()
export class RecomendacaoService {
  private readonly logger = new Logger(RecomendacaoService.name);

  constructor(
    @InjectModel(Servico)
    private servicoModel: typeof Servico,
    @InjectModel(Solicitacao)
    private solicitacaoModel: typeof Solicitacao,
    @InjectModel(Veiculo)
    private veiculoModel: typeof Veiculo,
    @InjectModel(InteracaoUsuario)
    private interacaoUsuarioModel: typeof InteracaoUsuario,
  ) {}

  async obterRecomendacoes(usuarioId: number) {
    try {
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
      throw new InternalServerErrorException('Erro no processar recomendações');
    }
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

    return populares.map((p) => {
      const servico = p.servico;

      return {
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
      };
    });
  }

  async criarInteracao(
    usuarioId: number,
    interacaoDto: RecomendacaoInteracaoRequestDto,
  ): Promise<RecomendacaoInteracaoResponseDto> {
    try {
      this.logger.log(
        `Registrando interação do usuário ${usuarioId} na categoria ${interacaoDto.categoriaBlog}`,
      );

      const interacao = await this.interacaoUsuarioModel.create({
        usuarioId,
        categoriaBlog: interacaoDto.categoriaBlog,
        dataInteracao: interacaoDto.dataInteracao,
      });

      this.logger.log(
        `Interação registrada com sucesso. ID ${interacao.id} para usuário ${usuarioId}`,
      );

      return {
        id: interacao.id,
        usuarioId,
        categoriaBlog: interacao.categoriaBlog,
        dataInteracao: String(interacao.dataInteracao),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';

      this.logger.error(
        `Falha ao salvar interação do usuário ${usuarioId}: ${errorMessage}`,
      );

      throw new InternalServerErrorException(
        'Não foi possível registrar a interação com o blog neste momento.',
      );
    }
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

  async buscarTransferenciaPropriedade(usuarioId: number): Promise<any[]> {
    try {
      this.logger.log(`Buscando transferências de propriedade do usuário com id ${usuarioId}`);

      const veiculosUsuario = await this.veiculoModel.findAll({
        where: { usuarioId },
        raw: true,
      });

      if (!veiculosUsuario || veiculosUsuario.length === 0) {
        this.logger.warn(`Nenhum veículo encontrado para usuário ${usuarioId}`);
        return [];
      }

      for (const veiculo of veiculosUsuario) {
        const solicitacaoExistente = await this.solicitacaoModel.findOne({
          where: {
            veiculo_id: veiculo.id,
            servico_id: 2, 
            status: { [Op.ne]: 'cancelado' } 
          }
        });

        if (!solicitacaoExistente) {
          this.logger.warn(`Veículo ${veiculo.id} - ${veiculo.placa} não possui solicitação de transferência`);
          return [{
            id: 2,
            nome: 'Transferência de Propriedade',
            descricao: 'Descrição de transferência de propriedade'
          }];
        }
      }

      this.logger.log(`Todos os veículos do usuário ${usuarioId} já possuem transferência solicitada`);
      return [];

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(
        `Erro ao buscar transferências de propriedade para usuário ${usuarioId}: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'Erro ao processar verificação de transferência de propriedade'
      );
    }
  }
}
