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
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';
import { DebitoVeiculo } from 'src/models/debito-veiculo.model';

import {
  DashboardReturnDto,
  GeralDto,
  SolicitacoesDto,
  VeiculosDto,
  ServicosDto,
  FinanceiroDto,
} from './dto/dashboard-return.dto';
import type { ModelCtor } from 'sequelize-typescript';
import type {
  ResultadoReceita,
  ResultadoTicketMedio,
  ResultadoHistoricoMensal,
  ResultadoInadimplencia,
  ResultadoPrevisaoCaixa,
  ResultadoDistribuicaoMetodo,
  ResultadoDistribuicaoTipo,
  StatusCountRaw,
  ParcelasVencidasRaw,
  TempoConclusaoRaw,
  DebitoVeiculoRaw,
} from './dashboard.types';
import { MaisSolicitadosRow, ReceitaPorServicoRow } from './dashboard.types';

@Injectable()
export class DashboardService {
  private readonly DIAS_ALERTA_VENCIMENTO = 3;

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
    @InjectModel(Usuario)
    private readonly usuarioModel: typeof Usuario,
    @InjectModel(DebitoVeiculo)
    private readonly debitoVeiculoModel: typeof DebitoVeiculo,
    @InjectModel(Veiculo)
    private readonly veiculoModel: typeof Veiculo,
  ) {}

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

  private converterData(inicioParam?: string, fimParam?: string) {
    const dataFim = fimParam ? new Date(fimParam) : new Date();
    dataFim.setHours(23, 59, 59, 999);

    const dataInicio = inicioParam
      ? new Date(inicioParam)
      : new Date(new Date(dataFim).setMonth(new Date(dataFim).getMonth() - 6));
    dataInicio.setHours(0, 0, 0, 0);
    return { dataInicio, dataFim };
  }

  /** Retorna dados gerais: solicitações, documentos, clientes e débitos do período */
  async obterDadosGerais(inicio?: string, fim?: string): Promise<GeralDto> {
    const { dataInicio, dataFim } = this.converterData(inicio, fim);
    const hoje = new Date();

    const [
      porStatusRaw,
      documentosPendentesValidacao,
      clientesNovosMesAtual,
      solicitacoesConcluidas,
      debitosEmAbertoQuantidade,
      debitosEmAbertoValor,
      parcelasVencidasResult,
    ] = await Promise.all([
      this.solicitacaoModel.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('Solicitacao.id')), 'quantidade'],
        ],
        where: {
          dataSolicitacao: { [Op.between]: [dataInicio, dataFim] },
        },
        group: [col('Solicitacao.status')],
        raw: true,
      }) as unknown as Promise<StatusCountRaw[]>,
      this.documentoSolicitacaoModel.count({
        where: { statusValidacao: 'pendente' },
      }),
      this.usuarioModel.count({
        where: {
          nivel: 'cliente',
          dataCadastro: { [Op.between]: [dataInicio, dataFim] },
        },
      }),
      this.solicitacaoModel.count({
        where: {
          status: 'concluido',
          dataConclusao: { [Op.between]: [dataInicio, dataFim] },
        },
      }),
      this.debitoModel.count({
        where: { status: 'pendente' },
      }),
      this.debitoModel.sum('valor', {
        where: { status: 'pendente' },
      }),
      this.parcelaModel.findOne({
        attributes: [
          [fn('SUM', col('valor')), 'valorTotal'],
          [fn('COUNT', col('id')), 'quantidadeParcelas'],
        ],
        where: {
          vencimento: { [Op.lt]: hoje },
          status: { [Op.ne]: 'pago' },
        },
        raw: true,
      }) as Promise<ParcelasVencidasRaw | null>,
    ]);

    const porStatusBase = {
      recebido: 0,
      emAndamento: 0,
      aguardandoPagamento: 0,
      aguardandoDocumento: 0,
      concluido: 0,
      cancelado: 0,
    };

    const porStatus = porStatusRaw.reduce((acc, item) => {
      const quantidade = Number(item.quantidade ?? 0);
      if (item.status === 'recebido') acc.recebido = quantidade;
      if (item.status === 'em_andamento') acc.emAndamento = quantidade;
      if (item.status === 'aguardando_pagamento')
        acc.aguardandoPagamento = quantidade;
      if (item.status === 'aguardando_documento')
        acc.aguardandoDocumento = quantidade;
      if (item.status === 'concluido') acc.concluido = quantidade;
      if (item.status === 'cancelado') acc.cancelado = quantidade;
      return acc;
    }, porStatusBase);

    const solicitacoesEmAberto =
      porStatus.recebido +
      porStatus.emAndamento +
      porStatus.aguardandoPagamento +
      porStatus.aguardandoDocumento;

    const totalSolicitacoesPeriodo: number = Object.values(porStatus).reduce(
      (a: number, b: number) => a + b,
      0,
    );

    const taxaCancelamentoPct =
      totalSolicitacoesPeriodo > 0
        ? Number(
            ((porStatus.cancelado / totalSolicitacoesPeriodo) * 100).toFixed(2),
          )
        : 0;

    return {
      solicitacoesEmAberto,
      solicitacoesConcluidas,
      documentosPendentesValidacao,
      clientesNovosMesAtual,
      taxaCancelamentoPct,
      debitosEmAberto: {
        quantidade: Number(debitosEmAbertoQuantidade ?? 0),
        valorTotal: Number(debitosEmAbertoValor ?? 0),
      },
      parcelasVencidasNaoPagas: {
        quantidade: Number(parcelasVencidasResult?.quantidadeParcelas ?? 0),
        valorTotal: Number(parcelasVencidasResult?.valorTotal ?? 0),
      },
    };
  }

  /** Retorna dados de solicitações: status, prazos, tempo de conclusão */
  async obterDadosSolicitacoes(
    inicio?: string,
    fim?: string,
  ): Promise<SolicitacoesDto> {
    const { dataInicio, dataFim } = this.converterData(inicio, fim);

    const statusAbertos = [
      'recebido',
      'aguardando_pagamento',
      'aguardando_documento',
      'em_andamento',
    ];

    const [
      porStatusRaw,
      proximasDeVencer,
      tempoConclusaoRaw,
      foraDoPrazoQuantidade,
      totalConcluidas,
    ] = await Promise.all([
      this.solicitacaoModel.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('Solicitacao.id')), 'quantidade'],
        ],
        where: {
          dataSolicitacao: { [Op.between]: [dataInicio, dataFim] },
        },
        group: [col('Solicitacao.status')],
        raw: true,
      }) as unknown as Promise<StatusCountRaw[]>,
      this.solicitacaoModel.count({
        include: [{ model: Servico, attributes: [], required: true }],
        where: {
          status: { [Op.in]: statusAbertos },
          dataSolicitacao: { [Op.between]: [dataInicio, dataFim] },
          [Op.and]: [
            literal('`servico`.`prazo_estimado_dias` IS NOT NULL'),
            literal(`
            DATEDIFF(NOW(), \`Solicitacao\`.\`data_solicitacao\`)
            BETWEEN GREATEST(\`servico\`.\`prazo_estimado_dias\` - ${this.DIAS_ALERTA_VENCIMENTO}, 0)
            AND \`servico\`.\`prazo_estimado_dias\`
          `),
          ],
        },
      }),
      this.solicitacaoModel.findAll({
        attributes: [
          [col('Solicitacao.servico_id'), 'servicoId'],
          [col('servico.nome'), 'servicoNome'],
          [col('servico.prazo_estimado_dias'), 'prazoEstimadoDias'],
          [
            fn(
              'AVG',
              literal(
                'DATEDIFF(`Solicitacao`.`data_conclusao`, `Solicitacao`.`data_solicitacao`)',
              ),
            ),
            'mediaRealDias',
          ],
          [fn('COUNT', col('Solicitacao.id')), 'totalConcluidas'],
        ],
        include: [{ model: Servico, attributes: [], required: true }],
        where: {
          status: 'concluido',
          dataConclusao: { [Op.between]: [dataInicio, dataFim] },
          [Op.and]: [literal('`servico`.`prazo_estimado_dias` IS NOT NULL')],
        },
        group: [
          col('Solicitacao.servico_id'),
          col('servico.id'),
          col('servico.nome'),
          col('servico.prazo_estimado_dias'),
        ],
        order: [[literal('mediaRealDias'), 'DESC']],
        raw: true,
      }) as unknown as Promise<TempoConclusaoRaw[]>,
      this.solicitacaoModel.count({
        include: [{ model: Servico, attributes: [], required: true }],
        where: {
          status: 'concluido',
          dataConclusao: { [Op.between]: [dataInicio, dataFim] },
          [Op.and]: [
            literal('`servico`.`prazo_estimado_dias` IS NOT NULL'),
            literal(`
            DATEDIFF(\`Solicitacao\`.\`data_conclusao\`, \`Solicitacao\`.\`data_solicitacao\`)
            > \`servico\`.\`prazo_estimado_dias\`
          `),
          ],
        },
      }),
      this.solicitacaoModel.count({
        where: { status: 'concluido' },
      }),
    ]);

    const porStatusBase = {
      recebido: 0,
      emAndamento: 0,
      aguardandoPagamento: 0,
      aguardandoDocumento: 0,
      concluido: 0,
      cancelado: 0,
    };

    const porStatus = porStatusRaw.reduce((acc, item) => {
      const quantidade = Number(item.quantidade ?? 0);
      if (item.status === 'recebido') acc.recebido = quantidade;
      if (item.status === 'em_andamento') acc.emAndamento = quantidade;
      if (item.status === 'aguardando_pagamento')
        acc.aguardandoPagamento = quantidade;
      if (item.status === 'aguardando_documento')
        acc.aguardandoDocumento = quantidade;
      if (item.status === 'concluido') acc.concluido = quantidade;
      if (item.status === 'cancelado') acc.cancelado = quantidade;
      return acc;
    }, porStatusBase);

    const tempoConclusaoPorServico = tempoConclusaoRaw.map((item) => ({
      servicoId: Number(item.servicoId),
      servicoNome: item.servicoNome,
      prazoEstimadoDias: Number(item.prazoEstimadoDias),
      mediaRealDias: Number(Number(item.mediaRealDias).toFixed(2)),
      totalConcluidas: Number(item.totalConcluidas),
    }));

    const percentual =
      totalConcluidas > 0
        ? Number(((foraDoPrazoQuantidade / totalConcluidas) * 100).toFixed(2))
        : 0;

    return {
      porStatus,
      proximasDeVencer: { quantidade: proximasDeVencer },
      tempoConclusaoPorServico,
      foraDoPrazo: {
        quantidade: foraDoPrazoQuantidade,
        totalConcluidas,
        percentual,
      },
    };
  }

  /** Retorna dados de veículos: cadastrados, com solicitações ativas e débitos pendentes */
  async obterDadosVeiculos(): Promise<VeiculosDto> {
    const [
      totalVeiculosCadastrados,
      veiculosComSolicitacaoAtiva,
      debitosPendentesResult,
    ] = await Promise.all([
      this.veiculoModel.count(),
      this.solicitacaoModel.count({
        where: {
          veiculoId: { [Op.ne]: null },
          status: {
            [Op.in]: [
              'recebido',
              'aguardando_pagamento',
              'aguardando_documento',
              'em_andamento',
            ],
          },
        },
        distinct: true,
        col: 'veiculo_id',
      }),
      this.debitoVeiculoModel.findAll({
        include: [
          {
            model: Debito,
            where: { status: 'pendente' },
            attributes: [],
          },
          {
            model: Veiculo,
            attributes: ['id', 'placa'],
          },
        ],
        attributes: [
          'idVeiculo',
          [fn('COUNT', col('DebitoVeiculo.id')), 'totalDebitos'],
          [fn('SUM', col('debito.valor')), 'valorTotal'],
        ],
        group: ['idVeiculo', 'veiculo.id'],
        raw: true,
        nest: true,
      }) as unknown as Promise<DebitoVeiculoRaw[]>,
    ]);

    const porVeiculo = debitosPendentesResult.map((item) => ({
      veiculoId: item.idVeiculo,
      placa: item.veiculo.placa,
      totalDebitos: Number(item.totalDebitos),
      valorTotal: Number(item.valorTotal),
    }));

    const valorTotalGeral = porVeiculo.reduce(
      (acc, item) => acc + item.valorTotal,
      0,
    );

    return {
      totalCadastrados: totalVeiculosCadastrados,
      comSolicitacaoAtiva: veiculosComSolicitacaoAtiva,
      comDebitoPendente: porVeiculo.length,
      debitosPendentes: {
        valorTotal: valorTotalGeral,
        porVeiculo,
      },
    };
  }

  /** Retorna dados de serviços: ativos, pausados e receita por serviço */
  async obterDadosServicos(
    inicio?: string,
    fim?: string,
  ): Promise<ServicosDto> {
    const { dataInicio, dataFim } = this.converterData(inicio, fim);
    const [
      servicosAtivos,
      servicosPausados,
      maisSolicitadosRaw,
      receitaPorServicoRaw,
      todosServicos,
    ] = await Promise.all([
      this.servicoModel.count({
        where: { ativo: true },
      }),
      this.servicoModel.count({
        where: { [Op.or]: [{ ativo: false }, { ativo: null }] },
      }),
      this.solicitacaoModel.findAll({
        attributes: [
          [col('Solicitacao.servico_id'), 'servicoId'],
          [fn('COUNT', col('Solicitacao.id')), 'totalSolicitacoes'],
        ],
        include: [
          { model: Servico, attributes: ['id', 'nome'], as: 'servico' },
        ],
        where: {
          dataSolicitacao: { [Op.between]: [dataInicio, dataFim] },
        },
        group: ['servico.id', 'Solicitacao.servico_id'],
        order: [[literal('totalSolicitacoes'), 'DESC']],
        limit: 5,
      }) as unknown as Promise<MaisSolicitadosRow[]>,
      this.debitoServicoModel.findAll({
        attributes: [
          [col('DebitoServico.id_servico'), 'servicoId'],
          [fn('COUNT', col('DebitoServico.id')), 'totalSolicitacoes'],
          [fn('SUM', col('debito.valor')), 'receitaTotal'],
        ],
        include: [
          { model: Servico, attributes: ['id', 'nome'], as: 'servico' },
          {
            model: Debito,
            attributes: [],
            as: 'debito',
            where: { createdAt: { [Op.between]: [dataInicio, dataFim] } },
          },
        ],
        group: ['servico.id', 'DebitoServico.id_servico'],
        order: [[literal('receitaTotal'), 'DESC']],
        limit: 5,
      }) as unknown as Promise<ReceitaPorServicoRow[]>,
      this.servicoModel.findAll({
        where: { ativo: true },
        attributes: ['id', 'nome'],
      }),
    ]);

    const maisSolicitados = maisSolicitadosRaw.map((item) => ({
      servicoId: Number(item.get('servicoId') ?? 0),
      nome: item.servico?.nome ?? '',
      totalSolicitacoes: Number(item.get('totalSolicitacoes') ?? 0),
    }));

    const receitaPorServico = receitaPorServicoRaw.map((item) => ({
      servicoId: Number(item.get('servicoId') ?? 0),
      nome: item.servico?.nome ?? '',
      totalSolicitacoes: Number(item.get('totalSolicitacoes') ?? 0),
      receitaTotal: Number(item.get('receitaTotal') ?? 0),
    }));

    const receitaMap = new Map(receitaPorServico.map((r) => [r.servicoId, r]));

    const receitaPorServicoCompleto = todosServicos.map((servico) => {
      const dados = receitaMap.get(servico.id);
      return {
        servicoId: servico.id,
        nome: servico.nome,
        totalSolicitacoes: dados?.totalSolicitacoes ?? 0,
        receitaTotal: dados?.receitaTotal ?? 0,
      };
    });

    return {
      ativos: servicosAtivos,
      pausados: servicosPausados,
      maisSolicitados,
      receitaPorServicoCompleto,
    };
  }

  /** Retorna dados financeiros: receita, débitos, parcelas, histórico mensal e distribuição de pagamentos */
  async obterDadosFinanceiro(
    inicio?: string,
    fim?: string,
  ): Promise<FinanceiroDto> {
    const { dataInicio, dataFim } = this.converterData(inicio, fim);
    const hoje = new Date();
    const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      receitaRealizadaResult,
      receitaPendente,
      receitaTaxa,
      ticketMedioResult,
      historicoMensalResult,
      inadimplenciaResult,
      previsaoCaixaResult,
      porMetodoResult,
      porTipoResult,
    ] = await Promise.all([
      this.pagamentoModel.findOne({
        attributes: [[fn('SUM', col('debito.valor')), 'total']],
        include: [{ model: Debito, where: { status: 'pago' }, attributes: [] }],
        where: { createdAt: { [Op.between]: [dataInicio, dataFim] } },
        raw: true,
      }) as Promise<ResultadoReceita | null>,
      this.debitoModel.sum('valor', {
        where: { status: 'pendente' },
      }),
      this.pagamentoModel.sum('taxa', {
        where: { createdAt: { [Op.between]: [dataInicio, dataFim] } },
      }),
      this.pagamentoModel.findOne({
        attributes: [[fn('AVG', col('valor_total')), 'media']],
        where: { createdAt: { [Op.between]: [dataInicio, dataFim] } },
        raw: true,
      }) as Promise<ResultadoTicketMedio | null>,
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
      }) as Promise<ResultadoInadimplencia | null>,
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
      }) as Promise<ResultadoPrevisaoCaixa | null>,
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

    // ─── Processamento dos dados financeiros ─────────────────────────────────

    const receitaRealizada = Number(receitaRealizadaResult?.total ?? 0);
    const receitaPendenteNum = Number(receitaPendente ?? 0);
    const receitaTaxaNum = Number(receitaTaxa ?? 0);
    const ticketMedio = Number(ticketMedioResult?.media ?? 0);

    const mesesPeriodo = this.gerarMesesNoPeriodo(dataInicio, dataFim);
    const mapaHistorico = new Map<string, number>(
      historicoMensalResult.map((m: ResultadoHistoricoMensal) => [
        m.mes,
        Number(m.receitaRealizada ?? 0),
      ]),
    );

    const historicoMensal = mesesPeriodo.map((mes) => ({
      mes,
      receitaRealizada: mapaHistorico.get(mes) ?? (0 as number),
    }));

    const somaHistorico = historicoMensal.reduce(
      (acc, m) => acc + m.receitaRealizada,
      0,
    );
    const mediaMensalReceita =
      mesesPeriodo.length > 0
        ? Number((somaHistorico / mesesPeriodo.length).toFixed(2))
        : 0;

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
      receitaRealizada,
      receitaPendente: receitaPendenteNum,
      receitaTaxa: receitaTaxaNum,
      ticketMedio,
      mediaMensalReceita,
      historicoMensal,
      inadimplencia: {
        valorTotal: Number(inadimplenciaResult?.valorTotal ?? 0),
        quantidadePagamentos: Number(
          inadimplenciaResult?.quantidadePagamentos ?? 0,
        ),
        quantidadeParcelas: Number(
          inadimplenciaResult?.quantidadeParcelas ?? 0,
        ),
      },
      previsaoCaixa30Dias: {
        valorTotal: Number(previsaoCaixaResult?.valorTotal ?? 0),
        quantidadeParcelas: Number(
          previsaoCaixaResult?.quantidadeParcelas ?? 0,
        ),
      },
      porMetodoPagamento,
      porTipoPagamento,
    };
  }

  /** Função principal que orquestra o retorno geral do dashboard */
  async retornoTotalDashboard(
    inicioParam?: string,
    fimParam?: string,
  ): Promise<DashboardReturnDto> {
    const [geral, solicitacoes, veiculos, servicos, financeiro] =
      await Promise.all([
        this.obterDadosGerais(inicioParam, fimParam),
        this.obterDadosSolicitacoes(inicioParam, fimParam),
        this.obterDadosVeiculos(),
        this.obterDadosServicos(inicioParam, fimParam),
        this.obterDadosFinanceiro(inicioParam, fimParam),
      ]);

    return {
      geral: {
        solicitacoesEmAberto: geral.solicitacoesEmAberto,
        solicitacoesConcluidas: geral.solicitacoesConcluidas,
        documentosPendentesValidacao: geral.documentosPendentesValidacao,
        clientesNovosMesAtual: geral.clientesNovosMesAtual,
        taxaCancelamentoPct: geral.taxaCancelamentoPct,
        debitosEmAberto: geral.debitosEmAberto,
        parcelasVencidasNaoPagas: geral.parcelasVencidasNaoPagas,
      },
      solicitacoes,
      servicos,
      financeiro,
      veiculos,
    };
  }
}
