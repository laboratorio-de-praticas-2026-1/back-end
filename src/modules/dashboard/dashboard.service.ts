import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, literal, Op } from 'sequelize';
import { Debito } from 'src/models/debito.model';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Pagamento } from 'src/models/pagamento.model';
import { Parcela } from 'src/models/parcela.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Servico } from 'src/models/servico.model';
import { DebitoServico } from 'src/models/debito-servico.model';
import { DashboardReturnDto } from './dto/dashboard-return.dto';
import type { ModelCtor } from 'sequelize-typescript';
import type {
  ResultadoReceita,
  ResultadoTicketMedio,
  ResultadoHistoricoMensal,
  ResultadoInadimplencia,
  ResultadoPrevisaoCaixa,
  ResultadoDistribuicaoMetodo,
  ResultadoDistribuicaoTipo,
} from './dashboard.types';
import {
  MaisSolicitadosRow,
  ReceitaPorServicoRow,
} from './dashboard.types';



@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Solicitacao)
    private readonly solicitacaoModel: ModelCtor<Solicitacao>,
    @InjectModel(DocumentoSolicitacao)
    private readonly documentoSolicitacaoModel: ModelCtor<DocumentoSolicitacao>,
    @InjectModel(Debito)
    private readonly debitoModel: ModelCtor<Debito>,
    @InjectModel(Pagamento)
    private readonly pagamentoModel: ModelCtor<Pagamento>,
    @InjectModel(Parcela)
    private readonly parcelaModel: ModelCtor<Parcela>,
    @InjectModel(Servico)
    private readonly servicoModel: typeof Servico,
    @InjectModel(DebitoServico)
    private readonly debitoServicoModel: typeof DebitoServico,
  ) {}




  //função para gerar os meses no período selecionado
  private gerarMesesNoPeriodo(inicio: Date, fim: Date): string[] {
    const meses: string[] = [];
    const atual = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    const fimMes = new Date(fim.getFullYear(), fim.getMonth(), 1);

    while (atual <= fimMes) {
      const ano = atual.getFullYear();
      const mes = String(atual.getMonth() + 1).padStart(2, '0');
      meses.push(`${ano}-${mes}`);
      atual.setMonth(atual.getMonth() + 1);
    }

    return meses;
  }

  async retornarInfosDashboard(
    inicioParam?: string,
    fimParam?: string,
  ): Promise<DashboardReturnDto> {
    const dataFim = fimParam ? new Date(fimParam) : new Date();
    dataFim.setHours(23, 59, 59, 999);

    const dataInicio = inicioParam
      ? new Date(inicioParam)
      : new Date(new Date(dataFim).setMonth(new Date(dataFim).getMonth() - 6));
    dataInicio.setHours(0, 0, 0, 0);

    const hoje = new Date();
    const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

    const solicitacoesQuery = Promise.all([
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

      this.solicitacaoModel.count({ where: { status: 'concluido' } }),
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

    const financeiroQuery: Promise<
      [
        ResultadoReceita | null,
        number,
        number,
        ResultadoTicketMedio | null,
        ResultadoHistoricoMensal[],
        ResultadoInadimplencia | null,
        ResultadoPrevisaoCaixa | null,
        ResultadoDistribuicaoMetodo[],
        ResultadoDistribuicaoTipo[],
      ]
    > = Promise.all([
      this.pagamentoModel.findOne({
        attributes: [[fn('SUM', col('debito.valor')), 'total']],
        include: [{ model: Debito, where: { status: 'pago' }, attributes: [] }],
        where: { createdAt: { [Op.between]: [dataInicio, dataFim] } },
        raw: true,
      }) as unknown as Promise<ResultadoReceita | null>,

      this.debitoModel.sum('valor', { where: { status: 'pendente' } }),

      this.pagamentoModel.sum('taxa', {
        where: { createdAt: { [Op.between]: [dataInicio, dataFim] } },
      }),

      this.pagamentoModel.findOne({
        attributes: [[fn('AVG', col('valor_total')), 'media']],
        where: { createdAt: { [Op.between]: [dataInicio, dataFim] } },
        raw: true,
      }) as unknown as Promise<ResultadoTicketMedio | null>,

      this.pagamentoModel.findAll({
        attributes: [
          [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'mes'],
          [fn('SUM', col('valor_total')), 'receitaRealizada'],
        ],
        where: { createdAt: { [Op.between]: [dataInicio, dataFim] } },
        group: [fn('DATE_FORMAT', col('created_at'), '%Y-%m')],
        order: [[fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'ASC']],
        raw: true,
      }) as unknown as Promise<ResultadoHistoricoMensal[]>,

      this.parcelaModel.findOne({
        attributes: [
          [fn('SUM', col('valor')), 'valorTotal'],
          [literal('COUNT(DISTINCT id_pagamento)'), 'quantidadePagamentos'],
          [fn('COUNT', col('id')), 'quantidadeParcelas'],
        ],
        where: {
          vencimento: { [Op.lt]: hoje },
          status: { [Op.ne]: 'pago' },
        },
        raw: true,
      }) as unknown as Promise<ResultadoInadimplencia | null>,

      this.parcelaModel.findOne({
        attributes: [
          [fn('SUM', col('valor')), 'valorTotal'],
          [fn('COUNT', col('id')), 'quantidadeParcelas'],
        ],
        where: {
          vencimento: { [Op.between]: [hoje, em30Dias] },
          status: { [Op.ne]: 'pago' },
        },
        raw: true,
      }) as unknown as Promise<ResultadoPrevisaoCaixa | null>,

      this.pagamentoModel.findAll({
        attributes: [
          ['metodo_pagamento', 'metodo'],
          [fn('COUNT', col('id')), 'quantidade'],
          [fn('SUM', col('valor_total')), 'valorTotal'],
        ],
        where: { createdAt: { [Op.between]: [dataInicio, dataFim] } },
        group: ['metodo_pagamento'],
        raw: true,
      }) as unknown as Promise<ResultadoDistribuicaoMetodo[]>,

      this.pagamentoModel.findAll({
        attributes: [
          ['tipo_pagamento', 'tipo'],
          [fn('COUNT', col('id')), 'quantidade'],
          [fn('SUM', col('valor_total')), 'valorTotal'],
        ],
        where: { createdAt: { [Op.between]: [dataInicio, dataFim] } },
        group: ['tipo_pagamento'],
        raw: true,
      }) as unknown as Promise<ResultadoDistribuicaoTipo[]>,
    ]);

    const [
      [
        solicitacoesEmAberto,
        solicitacoesConcluidas,
        documentosPendentesValidacao,
        servicosAtivos,
        servicosPausados,
        maisSolicitadosRaw,
        receitaPorServicoRaw,
      ],
      [
        receitaRealizadaResult,
        receitaPendenteRaw,
        receitaTaxaRaw,
        ticketMedioResult,
        historicoMensalResult,
        inadimplenciaResult,
        previsaoCaixaResult,
        porMetodoResult,
        porTipoResult,
      ],
    ] = await Promise.all([solicitacoesQuery, financeiroQuery]);

    const maisSolicitados = (maisSolicitadosRaw as unknown as MaisSolicitadosRow[]).map(
      (item) => ({
        servicoId: Number(item.get('servicoId') ?? 0),
        nome: item.servico?.nome ?? '',
        totalSolicitacoes: Number(item.get('totalSolicitacoes') ?? 0),
      }),
    );

    const receitaPorServico = (
      receitaPorServicoRaw as unknown as ReceitaPorServicoRow[]
    ).map((item) => ({
      servicoId: Number(item.get('servicoId') ?? 0),
      nome: item.servico?.nome ?? '',
      totalSolicitacoes: Number(item.get('totalSolicitacoes') ?? 0),
      receitaTotal: Number(item.get('receitaTotal') ?? 0),
    }));

    const receitaRealizada = Number(receitaRealizadaResult?.total ?? 0);
    const receitaPendente = Number(receitaPendenteRaw ?? 0);
    const receitaTaxa = Number(receitaTaxaRaw ?? 0);
    const ticketMedio = Number(ticketMedioResult?.media ?? 0);

    const mesesPeriodo = this.gerarMesesNoPeriodo(dataInicio, dataFim);

    const mapa = new Map(
      historicoMensalResult.map((m: ResultadoHistoricoMensal) => [
        m.mes,
        Number(m.receitaRealizada ?? 0),
      ]),
    );

    const historicoMensal = mesesPeriodo.map((mes) => ({
      mes,
      receitaRealizada: mapa.get(mes) ?? 0,
    }));

    const totalMeses = mesesPeriodo.length;

    const somaHistorico = historicoMensal.reduce(
      (acc, m) => acc + m.receitaRealizada,
      0,
    );

    const mediaMensalReceita =
      totalMeses > 0 ? Number((somaHistorico / totalMeses).toFixed(2)) : 0;

    const inadimplencia = {
      valorTotal: Number(inadimplenciaResult?.valorTotal ?? 0),
      quantidadePagamentos: Number(
        inadimplenciaResult?.quantidadePagamentos ?? 0,
      ),
      quantidadeParcelas: Number(inadimplenciaResult?.quantidadeParcelas ?? 0),
    };

    const previsaoCaixa30Dias = {
      valorTotal: Number(previsaoCaixaResult?.valorTotal ?? 0),
      quantidadeParcelas: Number(previsaoCaixaResult?.quantidadeParcelas ?? 0),
    };

    const porMetodoPagamento = porMetodoResult.map(
      (m: ResultadoDistribuicaoMetodo) => ({
        metodo: m.metodo,
        quantidade: Number(m.quantidade ?? 0),
        valorTotal: Number(m.valorTotal ?? 0),
      }),
    );

    const porTipoPagamento = porTipoResult.map(
      (t: ResultadoDistribuicaoTipo) => ({
        tipo: t.tipo,
        quantidade: Number(t.quantidade ?? 0),
        valorTotal: Number(t.valorTotal ?? 0),
      }),
    );

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
      financeiro: {
        receitaRealizada,
        receitaPendente,
        receitaTaxa,
        ticketMedio,
        mediaMensalReceita,
        historicoMensal,
        inadimplencia,
        previsaoCaixa30Dias,
        porMetodoPagamento,
        porTipoPagamento,
      },
    };
  }
}
