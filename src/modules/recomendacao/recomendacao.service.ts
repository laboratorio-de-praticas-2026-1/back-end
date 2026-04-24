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
import { RecomendacaoCategoriaBlogEnum } from './enums/recomendacao-categoria-blog.enum';

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
    @InjectModel(Veiculo)
    private veiculoModel: typeof Veiculo,
  ) {}

  async obterRecomendacoes(usuarioId: number) {
    try {
      const listaRecomendacoes: RecomendacaoRespostaDto[] = [];

      const recomendacaoSemVeiculo =
        await this.buscarUsuarioSemVeiculo(usuarioId);
      if (recomendacaoSemVeiculo) {
        return recomendacaoSemVeiculo.map(({ id, nome, descricao }) => ({
          id,
          nome,
          descricao,
        }));
      }

      const licenciamento = await this.buscarLicenciamentoAnual(usuarioId);
      if (licenciamento) listaRecomendacoes.push(licenciamento);

      const cnh = await this.buscarRenovacaoCNH(usuarioId);
      if (cnh) listaRecomendacoes.push(cnh);

      const transferencia =
        await this.buscarTransferenciaPropriedade(usuarioId);
      if (transferencia) listaRecomendacoes.push(transferencia);

      const infracao = await this.buscarRecursoMulta(usuarioId);
      if (infracao) {
        listaRecomendacoes.push(infracao);
      }

      const parcelamento = await this.buscarParcelamentoDebitos(usuarioId);
      if (parcelamento) listaRecomendacoes.push(parcelamento);

      const venda = await this.buscarComunicacaoVenda(usuarioId);
      if (venda) {
        listaRecomendacoes.push(venda);
      }

      if (listaRecomendacoes.length === 0) {
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
      }

      return listaRecomendacoes.map(({ id, nome, descricao }) => ({
        id,
        nome,
        descricao,
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro ao gerar recomendações: ${errorMessage}`);
      throw new InternalServerErrorException('Erro ao processar recomendações');
    }
  }

  async buscarUsuarioSemVeiculo(
    usuarioId: number,
  ): Promise<RecomendacaoRespostaDto[] | null> {
    try {
      const veiculos = await this.veiculoModel.findAll({
        where: { usuarioId },
      });

      if (!veiculos || veiculos.length === 0) {
        return [
          {
            id: 4,
            nome: 'Renovação de CNH',
            descricao:
              'Mantenha sua habilitação em dia. Verifique o prazo para renovação.',
          },
          {
            id: 8,
            nome: 'Mudança de Categoria CNH',
            descricao:
              'Deseja dirigir outros tipos de veículo? Veja como mudar sua categoria de CNH.',
          },
        ] as unknown as RecomendacaoRespostaDto[];
      }

      return null;
    } catch (error) {
      this.logger.error('Erro ao verificar usuário sem veículo', error);
      return null;
    }
  }

  async buscarTransferenciaPropriedade(
    usuarioId: number,
  ): Promise<RecomendacaoRespostaDto | null> {
    try {
      const veiculos = await this.veiculoModel.findAll({
        where: { usuarioId },
      });

      for (const veiculo of veiculos) {
        const jaExiste = await this.solicitacaoModel.findOne({
          where: {
            veiculoId: veiculo.id,
            servicoId: 2,
            status: {
              [Op.ne]: 'cancelado',
            },
          },
        });

        if (!jaExiste) {
          return {
            id: 2,
            nome: 'Transferência de Propriedade',
            descricao:
              'Identificamos que seu veículo ainda não possui transferência de titularidade. Regularize agora.',
          };
        }
      }

      return null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(
        `Erro na busca de transferência de propriedade: ${errorMessage}`,
      );
      return null;
    }
  }

  async buscarRecursoMulta(
    usuarioId: number,
  ): Promise<RecomendacaoRespostaDto | null> {
    try {
      const palavrasChave = [
        'multa',
        'infração',
        'infracao',
        'autuação',
        'autuacao',
        'radar',
        'transitar em velocidade',
      ];

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
                [Op.notIn]: ['cancelado', 'rejeitado'],
              },
            },
          });

          if (!jaExiste) {
            return {
              id: 6,
              nome: 'Recurso de Multa',
              descricao:
                'Identificamos uma multa pendente. Você tem o direito de recorrer e evitar pontos na sua CNH.',
            };
          }
        }
      }

      return null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';

      this.logger.error(`Erro na busca proativa de multas: ${errorMessage}`);

      return null;
    }
  }

  async buscarParcelamentoDebitos(
    usuarioId: number,
  ): Promise<RecomendacaoRespostaDto | null> {
    try {
      const veiculos = await this.veiculoModel.findAll({
        where: { usuarioId },
      });

      for (const veiculo of veiculos) {
        const debitos = await this.debitoModel.findAll({
          where: {
            tipo: 'veiculo',
            status: 'pendente',
          },
          include: [
            {
              model: Veiculo,
              where: { id: veiculo.id },
              through: { attributes: [] },
              required: true,
            },
          ],
        });

        if (debitos.length === 0) continue;

        const jaExiste = await this.solicitacaoModel.findOne({
          where: {
            servicoId: 10,
            veiculoId: veiculo.id,
            status: {
              [Op.ne]: 'cancelado',
            },
          },
        });

        if (!jaExiste) {
          return {
            id: 10,
            nome: 'Parcelamento de Débitos',
            descricao:
              'Você possui pendências financeiras. Parcele seus débitos em até 12x no cartão e mantenha seu veículo regularizado.',
          };
        }
      }

      return null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';

      this.logger.error(`Erro na busca de parcelamento: ${errorMessage}`);

      return null;
    }
  }

  async buscarComunicacaoVenda(
    usuarioId: number,
  ): Promise<RecomendacaoRespostaDto | null> {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);

      const interesseBlog = await this.interacaoUsuarioModel.findOne({
        where: {
          usuarioId,
          categoriaBlog: RecomendacaoCategoriaBlogEnum.DOCUMENTACAO,
          dataInteracao: {
            [Op.gte]: dataLimite,
          },
        },
      });

      const jaIniciouTransferencia = await this.solicitacaoModel.findOne({
        where: {
          usuarioId,
          servicoId: 2,
        },
      });

      if (interesseBlog || jaIniciouTransferencia) {
        return {
          id: 9,
          nome: 'Comunicação de Venda',
          descricao:
            'Evite multas e pontos de terceiros. Comunique a venda do seu veículo ao DETRAN imediatamente.',
        };
      }

      return null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(
        `Erro na busca de comunicação de venda: ${errorMessage}`,
      );
      return null;
    }
  }

  async buscarLicenciamentoAnual(
    usuarioId: number,
  ): Promise<RecomendacaoRespostaDto | null> {
    const gatilhoPorDigito: Record<string, number> = {
      '1': 3,
      '2': 4,
      '3': 5,
      '4': 6,
      '5': 7,
      '6': 7,
      '7': 8,
      '8': 9,
      '9': 10,
      '0': 11,
    };

    try {
      const veiculos = await this.veiculoModel.findAll({
        where: { usuarioId },
      });

      const mesAtual = new Date().getMonth() + 1;
      const anoAtual = new Date().getFullYear();

      for (const veiculo of veiculos) {
        const ultimoDigito = veiculo.placa.slice(-1);
        const mesGatilho = gatilhoPorDigito[ultimoDigito];

        if (mesAtual < mesGatilho) continue;

        const jaExiste = await this.solicitacaoModel.findOne({
          where: {
            veiculoId: veiculo.id,
            servicoId: 1,
            status: {
              [Op.notIn]: ['cancelado', 'rejeitado'],
            },
            dataSolicitacao: {
              [Op.between]: [
                new Date(`${anoAtual}-01-01`),
                new Date(`${anoAtual}-12-31`),
              ],
            },
          },
        });

        if (!jaExiste) {
          return {
            id: 1,
            nome: 'Licenciamento Anual',
            descricao: `O veículo de placa ${veiculo.placa} já está no período de licenciamento. Faça o licenciamento anual para evitar multas.`,
          };
        }
      }

      return null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(
        `Erro na busca de licenciamento anual: ${errorMessage}`,
      );
      return null;
    }
  }

  async buscarRenovacaoCNH(
    usuarioId: number,
  ): Promise<RecomendacaoRespostaDto | null> {
    try {
      const dezAnosAtras = new Date();
      dezAnosAtras.setFullYear(dezAnosAtras.getFullYear() - 10);

      const jaExiste = await this.solicitacaoModel.findOne({
        where: {
          usuarioId,
          servicoId: 4,
          status: {
            [Op.notIn]: ['cancelado', 'rejeitado'],
          },
          dataSolicitacao: {
            [Op.gte]: dezAnosAtras,
          },
        },
      });

      if (!jaExiste) {
        return {
          id: 4,
          nome: 'Renovação de CNH',
          descricao:
            'Mantenha sua habilitação em dia. Verifique o prazo para renovação.',
        };
      }

      return null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Erro na busca de renovação de CNH: ${errorMessage}`);
      return null;
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

    return populares.map((p) => ({
      id: p.servico.id,
      nome: p.servico.nome,
      descricao: p.servico.descricao,
    }));
  }

  async buscarAtributosPerfil(usuarioId: number): Promise<PerfilUsuarioDto[]> {
    try {
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
    } catch {
      throw new InternalServerErrorException('Conexão perdida');
    }
  }

  async criarInteracao(
    usuarioId: number,
    interacaoDto: RecomendacaoInteracaoRequestDto,
  ): Promise<RecomendacaoInteracaoResponseDto> {
    try {
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
    } catch {
      throw new InternalServerErrorException('Falha de gravação');
    }
  }
}
