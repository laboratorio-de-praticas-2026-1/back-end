import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { fn, col, literal, Op } from 'sequelize';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Servico } from 'src/models/servico.model';
import { Debito } from 'src/models/debito.model';
import { DebitoServico } from 'src/models/debito-servico.model';
import { DashboardReturnDto } from './dto/dashboard-return.dto';

type MaisSolicitadosRow = Solicitacao & {
  servico?: Servico;
  get(key: 'servicoId' | 'totalSolicitacoes'): string | number | null;
};

type ReceitaPorServicoRow = DebitoServico & {
  servico?: Servico;
  get(
    key: 'servicoId' | 'totalSolicitacoes' | 'receitaTotal',
  ): string | number | null;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Solicitacao)
    private readonly solicitacaoModel: typeof Solicitacao,

    @InjectModel(DocumentoSolicitacao)
    private readonly documentoSolicitacaoModel: typeof DocumentoSolicitacao,

    @InjectModel(Servico)
    private readonly servicoModel: typeof Servico,

    @InjectModel(DebitoServico)
    private readonly debitoServicoModel: typeof DebitoServico,

    @InjectModel(Debito)
    private readonly debitoModel: typeof Debito,
  ) {}

  private obterPeriodo(inicio?: string, fim?: string) {
    const hoje = new Date();

    const dataFim = fim ? new Date(`${fim}T23:59:59.999`) : hoje;

    const dataInicio = inicio
      ? new Date(`${inicio}T00:00:00.000`)
      : new Date(new Date().setMonth(new Date().getMonth() - 6));

    return { dataInicio, dataFim };
  }

  async retornarInfosDashboard(
    inicio?: string,
    fim?: string,
  ): Promise<DashboardReturnDto> {
    const { dataInicio, dataFim } = this.obterPeriodo(inicio, fim);

    const [
      solicitacoesEmAberto,
      solicitacoesConcluidas,
      documentosPendentesValidacao,
      servicosAtivos,
      servicosPausados,
      maisSolicitadosRaw,
      receitaPorServicoRaw,
    ] = await Promise.all([
      this.solicitacaoModel.count({
        where: {
          status: {
            [Op.in]: [
              'recebido',
              'aguardando_pagamento',
              'aguardando_documento',
              'em_andamento',
            ],
          },
        },
      }),

      this.solicitacaoModel.count({
        where: { status: 'concluido' },
      }),

      this.documentoSolicitacaoModel.count({
        where: { statusValidacao: 'pendente' },
      }),

      this.servicoModel.count({
        where: { ativo: true },
      }),

      this.servicoModel.count({
        where: {
          [Op.or]: [{ ativo: false }, { ativo: null }],
        },
      }),

      this.solicitacaoModel.findAll({
        attributes: [
          [col('Solicitacao.servico_id'), 'servicoId'],
          [fn('COUNT', col('Solicitacao.id')), 'totalSolicitacoes'],
        ],
        include: [
          {
            model: Servico,
            attributes: ['id', 'nome'],
            as: 'servico',
          },
        ],
        where: {
          dataSolicitacao: {
            [Op.between]: [dataInicio, dataFim],
          },
        },
        group: ['servico.id', 'Solicitacao.servico_id'],
        order: [[literal('totalSolicitacoes'), 'DESC']],
        limit: 5,
      }),

      this.debitoServicoModel.findAll({
        attributes: [
          [col('DebitoServico.id_servico'), 'servicoId'],
          [fn('COUNT', col('DebitoServico.id')), 'totalSolicitacoes'],
          [fn('SUM', col('debito.valor')), 'receitaTotal'],
        ],
        include: [
          {
            model: Servico,
            attributes: ['id', 'nome'],
            as: 'servico',
          },
          {
            model: Debito,
            attributes: [],
            as: 'debito',
            where: {
              createdAt: {
                [Op.between]: [dataInicio, dataFim],
              },
            },
          },
        ],
        group: ['servico.id', 'DebitoServico.id_servico'],
        order: [[literal('receitaTotal'), 'DESC']],
        limit: 5,
      }),
    ]);

    const maisSolicitados = (maisSolicitadosRaw as MaisSolicitadosRow[]).map(
      (item) => ({
        servicoId: Number(item.get('servicoId') ?? 0),
        nome: item.servico?.nome ?? '',
        totalSolicitacoes: Number(item.get('totalSolicitacoes') ?? 0),
      }),
    );

    const receitaPorServico = (
      receitaPorServicoRaw as ReceitaPorServicoRow[]
    ).map((item) => ({
      servicoId: Number(item.get('servicoId') ?? 0),
      nome: item.servico?.nome ?? '',
      totalSolicitacoes: Number(item.get('totalSolicitacoes') ?? 0),
      receitaTotal: Number(item.get('receitaTotal') ?? 0),
    }));

    return {
      solicitacoes: {
        solicitacoesEmAberto,
        solicitacoesConcluidas,
        documentosPendentesValidacao,
      },
      servicos: {
        ativos: servicosAtivos,
        pausados: servicosPausados,
        maisSolicitados,
        receitaPorServico,
      },
    };
  }
}
