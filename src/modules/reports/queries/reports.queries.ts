import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, literal } from 'sequelize';
import { Debito } from 'src/models/debito.model';
import { DebitoServico } from 'src/models/debito-servico.model';
import { DebitoVeiculo } from 'src/models/debito-veiculo.model';
import { DocumentoSolicitacao } from 'src/models/documento-solicitacao.model';
import { Pagamento } from 'src/models/pagamento.model';
import { Parcela } from 'src/models/parcela.model';
import { Servico } from 'src/models/servico.model';
import { Solicitacao } from 'src/models/solicitacao.model';
import { Usuario } from 'src/models/usuario.model';
import { Veiculo } from 'src/models/veiculo.model';

type StatusSolicitacao =
  | 'recebido'
  | 'aguardando_pagamento'
  | 'aguardando_documento'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado';

const STATUS_SOLICITACAO: StatusSolicitacao[] = [
  'recebido',
  'aguardando_pagamento',
  'aguardando_documento',
  'em_andamento',
  'concluido',
  'cancelado',
];

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeekMonday(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 (Sun) .. 6 (Sat)
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatDatePt(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function normalizeMethod(method: string): string {
  const v = method.trim().toLowerCase();
  if (v.includes('pix')) return 'pix';
  if (v.includes('boleto')) return 'boleto';
  if (v.includes('cart') || v.includes('card') || v.includes('crédito')) return 'cartao';
  return v || 'outros';
}

@Injectable()
export class ReportQueries {
  constructor(
    @InjectModel(Debito) private readonly debitoModel: typeof Debito,
    @InjectModel(DebitoServico)
    private readonly debitoServicoModel: typeof DebitoServico,
    @InjectModel(DebitoVeiculo)
    private readonly debitoVeiculoModel: typeof DebitoVeiculo,
    @InjectModel(DocumentoSolicitacao)
    private readonly documentoModel: typeof DocumentoSolicitacao,
    @InjectModel(Pagamento) private readonly pagamentoModel: typeof Pagamento,
    @InjectModel(Parcela) private readonly parcelaModel: typeof Parcela,
    @InjectModel(Servico) private readonly servicoModel: typeof Servico,
    @InjectModel(Solicitacao)
    private readonly solicitacaoModel: typeof Solicitacao,
    @InjectModel(Usuario) private readonly usuarioModel: typeof Usuario,
    @InjectModel(Veiculo) private readonly veiculoModel: typeof Veiculo,
  ) {}

  async getFinancialSummary(inicio: Date, fim: Date) {
    const debitos = await this.debitoModel.findAll({
      where: {
        createdAt: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
      include: [
        { model: Pagamento, required: false },
        {
          model: DebitoServico,
          required: false,
          include: [{ model: Servico, required: false }],
        },
        {
          model: DebitoVeiculo,
          required: false,
          include: [{ model: Veiculo, required: false }],
        },
      ],
    });

    const pagos = debitos.filter((d) => d.status === 'pago');
    const totalArrecadado = pagos.reduce((acc, d) => acc + toNumber(d.valor), 0);
    const totalTaxas = pagos.reduce(
      (acc, d) => acc + toNumber(d.pagamento?.taxa ?? 0),
      0,
    );
    const totalPendente = debitos
      .filter((d) => d.status === 'pendente')
      .reduce((acc, d) => acc + toNumber(d.valor), 0);

    return { totalArrecadado, totalTaxas, totalPendente };
  }

  async getFaturamentoDiluido(inicio: Date, fim: Date) {
    const pagamentos = await this.pagamentoModel.findAll({
      where: {
        createdAt: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
      order: [['createdAt', 'ASC']],
    });

    const buckets = new Map<string, { label: string; value: number; start: Date }>();

    for (const pagamento of pagamentos) {
      const createdAt = new Date(pagamento.createdAt);
      const weekStart = startOfWeekMonday(createdAt);
      const weekEnd = addDays(weekStart, 6);
      const key = `${weekStart.toISOString().slice(0, 10)}`;
      const current = buckets.get(key) ?? {
        label: `${formatDatePt(weekStart)} - ${formatDatePt(weekEnd)}`,
        value: 0,
        start: weekStart,
      };
      current.value += toNumber(pagamento.valorTotal);
      buckets.set(key, current);
    }

    return [...buckets.values()]
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map(({ label, value }) => ({ semana: label, valor: value }));
  }

  async getTodosDebitos(inicio: Date, fim: Date) {
    return this.debitoModel.findAll({
      where: {
        createdAt: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
      include: [
        { model: Pagamento, required: false },
        {
          model: DebitoServico,
          required: false,
          include: [{ model: Servico, required: false }],
        },
        {
          model: DebitoVeiculo,
          required: false,
          include: [
            {
              model: Veiculo,
              required: false,
              include: [{ model: Usuario, required: false }],
            },
          ],
        },
      ],
      order: [
        [
          literal(
            "CASE WHEN `status` = 'pendente' THEN 0 WHEN `status` = 'pago' THEN 1 ELSE 2 END",
          ),
          'ASC',
        ],
        ['createdAt', 'DESC'],
      ],
    });
  }

  async getParcelasVencer30Dias() {
    const hoje = startOfDay(new Date());
    const em30 = endOfDay(addDays(new Date(), 30));

    return this.parcelaModel.findAll({
      where: {
        status: { [Op.ne]: 'pago' },
        vencimento: { [Op.between]: [hoje, em30] },
      },
      include: [
        {
          model: Pagamento,
          required: true,
          include: [{ model: Debito, required: true }],
        },
      ],
      order: [['vencimento', 'ASC']],
    });
  }

  async getFluxoRecebimento(inicio: Date, fim: Date) {
    return this.pagamentoModel.findAll({
      where: {
        createdAt: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
      include: [{ model: Debito, required: true }],
      order: [['createdAt', 'ASC']],
    });
  }

  async getMetodosPagamento(inicio: Date, fim: Date) {
    const pagamentos = await this.pagamentoModel.findAll({
      where: {
        createdAt: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
    });

    const map: Record<string, number> = {};
    for (const p of pagamentos) {
      const key = normalizeMethod(p.metodoPagamento);
      map[key] = (map[key] ?? 0) + 1;
    }

    const ordered: Record<string, number> = {};
    for (const key of ['pix', 'boleto', 'cartao']) {
      if (map[key] !== undefined) ordered[key] = map[key];
    }
    for (const [key, value] of Object.entries(map)) {
      if (!(key in ordered)) ordered[key] = value;
    }
    return ordered;
  }

  async getDetalhesParcelas(inicio: Date, fim: Date) {
    const parcelas = await this.parcelaModel.findAll({
      include: [
        {
          model: Pagamento,
          required: true,
          where: {
            createdAt: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
          },
          include: [{ model: Debito, required: true }],
        },
      ],
      order: [['vencimento', 'ASC']],
    });

    const hoje = startOfDay(new Date());
    const vencidas = parcelas.filter(
      (p) => new Date(p.vencimento).getTime() < hoje.getTime() && p.status !== 'pago',
    );

    return { parcelas, vencidas };
  }

  async getArrecadacaoPorServico(inicio: Date, fim: Date) {
    const debitosServico = await this.debitoServicoModel.findAll({
      include: [
        {
          model: Debito,
          required: true,
          where: {
            status: 'pago',
            createdAt: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
          },
        },
        { model: Servico, required: true },
      ],
    });

    const map = new Map<string, { nome: string; total: number }>();
    for (const ds of debitosServico) {
      const nome = ds.servico?.nome ?? 'Sem serviço';
      const current = map.get(nome) ?? { nome, total: 0 };
      current.total += toNumber(ds.debito.valor);
      map.set(nome, current);
    }

    return [...map.values()]
      .sort((a, b) => b.total - a.total)
      .map((item, index) => ({ top: index + 1, ...item }));
  }

  async getFaturamentoComTaxa(inicio: Date, fim: Date) {
    const pagamentos = await this.pagamentoModel.findAll({
      where: {
        createdAt: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
    });

    return pagamentos.reduce(
      (acc, p) => acc + toNumber(p.valorTotal) + toNumber(p.taxa),
      0,
    );
  }

  async getServicosPrestados() {
    return this.servicoModel.findAll({
      order: [['id', 'ASC']],
    });
  }

  async getSolicitacoesPorServico(inicio: Date, fim: Date) {
    const solicitacoes = await this.solicitacaoModel.findAll({
      where: {
        dataSolicitacao: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
      include: [{ model: Servico, required: true }],
    });

    const map = new Map<string, { nome: string; total: number }>();
    for (const solicitacao of solicitacoes) {
      const nome = solicitacao.servico?.nome ?? 'Sem serviço';
      const current = map.get(nome) ?? { nome, total: 0 };
      current.total += 1;
      map.set(nome, current);
    }

    return [...map.values()].sort((a, b) => b.total - a.total);
  }

  async getSolicitacoesPorStatus(inicio: Date, fim: Date) {
    const solicitacoes = await this.solicitacaoModel.findAll({
      where: {
        dataSolicitacao: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
    });

    const porStatus: Record<string, number> = {};
    for (const status of STATUS_SOLICITACAO) porStatus[status] = 0;
    for (const solicitacao of solicitacoes) {
      porStatus[solicitacao.status] = (porStatus[solicitacao.status] ?? 0) + 1;
    }

    return { total: solicitacoes.length, porStatus };
  }

  async getTodasSolicitacoes(inicio: Date, fim: Date) {
    return this.solicitacaoModel.findAll({
      where: {
        dataSolicitacao: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
      include: [
        { model: Servico, required: true },
        { model: Usuario, required: true },
        { model: Veiculo, required: false },
      ],
      order: [['dataSolicitacao', 'DESC']],
    });
  }

  async getDocumentosPorStatus(inicio: Date, fim: Date) {
    const docs = await this.documentoModel.findAll({
      where: {
        dataUpload: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
    });

    const porStatus: Record<string, number> = {
      pendente: 0,
      aprovado: 0,
      rejeitado: 0,
    };

    for (const doc of docs) {
      porStatus[doc.statusValidacao] = (porStatus[doc.statusValidacao] ?? 0) + 1;
    }

    return { total: docs.length, porStatus };
  }

  async getDocumentosByStatus(
    status: 'pendente' | 'aprovado' | 'rejeitado',
    inicio: Date,
    fim: Date,
  ) {
    return this.documentoModel.findAll({
      where: {
        statusValidacao: status,
        dataUpload: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
      include: [
        {
          model: Solicitacao,
          required: true,
          include: [
            { model: Usuario, required: true },
            { model: Servico, required: true },
          ],
        },
      ],
      order: [['dataUpload', 'ASC']],
    });
  }

  async getTotalVeiculos(_inicio: Date, _fim: Date) {
    return this.veiculoModel.count();
  }

  async getVeiculosComDebitosPendentes(inicio: Date, fim: Date) {
    const debitos = await this.debitoVeiculoModel.findAll({
      include: [
        {
          model: Debito,
          required: true,
          where: {
            status: 'pendente',
            createdAt: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
          },
          include: [{ model: Pagamento, required: false }],
        },
        {
          model: Veiculo,
          required: true,
          include: [{ model: Usuario, required: true }],
        },
      ],
    });

    return debitos.sort((a, b) =>
      (a.veiculo?.placa ?? '').localeCompare(b.veiculo?.placa ?? ''),
    );
  }

  async getClientesNoperiodo(inicio: Date, fim: Date) {
    const total = await this.usuarioModel.count({
      where: { nivel: 'cliente' },
    });

    const clientes = await this.usuarioModel.findAll({
      where: {
        nivel: 'cliente',
        dataCadastro: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
      include: [
        { model: Veiculo, required: false },
        {
          model: Solicitacao,
          required: false,
          where: {
            dataSolicitacao: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
          },
        },
      ],
      order: [['dataCadastro', 'DESC']],
    });

    const clientesComSolicitacao = clientes.filter(
      (cliente) => (cliente.solicitacoes?.length ?? 0) > 0,
    ).length;
    const taxaConversao = clientes.length
      ? Math.round((clientesComSolicitacao / clientes.length) * 100)
      : 0;

    return { clientes, total, taxaConversao };
  }

  async getClientesComParcelasAtrasadas() {
    const parcelas = await this.parcelaModel.findAll({
      where: {
        status: { [Op.ne]: 'pago' },
        vencimento: { [Op.lt]: startOfDay(new Date()) },
      },
      include: [
        {
          model: Pagamento,
          required: true,
          include: [
            {
              model: Debito,
              required: true,
              include: [
                {
                  model: DebitoVeiculo,
                  required: false,
                  include: [
                    {
                      model: Veiculo,
                      required: false,
                      include: [{ model: Usuario, required: false }],
                    },
                  ],
                },
                {
                  model: DebitoServico,
                  required: false,
                  include: [{ model: Servico, required: false }],
                },
              ],
            },
          ],
        },
      ],
      order: [['vencimento', 'ASC']],
    });

    const serviceNames = new Map<number, string>();
    const aggregated = new Map<
      string,
      {
        nome: string;
        numParcelas: number;
        valorParcelas: number;
        dataInicio: Date;
        dataVenc: Date;
      }
    >();

    for (const parcela of parcelas) {
      const debito = parcela.pagamento?.debito;
      let nomeCliente = '—';

      const veiculo = debito?.debitoVeiculo?.veiculo;
      if (veiculo?.usuario?.nome) {
        nomeCliente = veiculo.usuario.nome;
      } else if (debito?.debitoServico?.servico?.id) {
        const servicoId = debito.debitoServico.servico.id;
        let cached = serviceNames.get(servicoId);
        if (!cached) {
          const ultimaSolicitacao = await this.solicitacaoModel.findOne({
            where: { servicoId },
            include: [{ model: Usuario, required: true }],
            order: [['dataSolicitacao', 'DESC']],
          });
          cached = ultimaSolicitacao?.usuario?.nome ?? debito.debitoServico.servico.nome;
          serviceNames.set(servicoId, cached);
        }
        nomeCliente = cached;
      }

      const atual = aggregated.get(nomeCliente) ?? {
        nome: nomeCliente,
        numParcelas: 0,
        valorParcelas: 0,
        dataInicio: parcela.pagamento?.createdAt ?? new Date(),
        dataVenc: parcela.vencimento,
      };

      atual.numParcelas += 1;
      atual.valorParcelas += toNumber(parcela.valor);
      if (
        new Date(parcela.pagamento?.createdAt ?? new Date()).getTime() <
        new Date(atual.dataInicio).getTime()
      ) {
        atual.dataInicio = parcela.pagamento?.createdAt ?? atual.dataInicio;
      }
      if (new Date(parcela.vencimento).getTime() < new Date(atual.dataVenc).getTime()) {
        atual.dataVenc = parcela.vencimento;
      }

      aggregated.set(nomeCliente, atual);
    }

    return [...aggregated.values()].sort(
      (a, b) => new Date(a.dataVenc).getTime() - new Date(b.dataVenc).getTime(),
    );
  }

  async getTempoMedioConclusao(inicio: Date, fim: Date) {
    const concluidas = await this.solicitacaoModel.findAll({
      where: {
        status: 'concluido',
        dataSolicitacao: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
        dataConclusao: { [Op.not]: null },
      },
      include: [{ model: Servico, required: true }],
      order: [['dataConclusao', 'ASC']],
    });

    const comparativo = concluidas.map((s) => {
      const tempoUtilizado = Math.max(
        0,
        Math.round(
          (new Date(s.dataConclusao as Date).getTime() -
            new Date(s.dataSolicitacao).getTime()) /
            86400000,
        ),
      );
      const prazoEstimado = s.servico?.prazoEstimadoDias ?? 0;
      return {
        id: s.id,
        servico: s.servico?.nome ?? '—',
        tempoUtilizado,
        prazoEstimado,
        dentroPrazo: tempoUtilizado <= prazoEstimado,
      };
    });

    const tempoMedio = comparativo.length
      ? Math.round(
          comparativo.reduce((acc, item) => acc + item.tempoUtilizado, 0) /
            comparativo.length,
        )
      : 0;

    const emAberto = await this.solicitacaoModel.findAll({
      where: {
        status: { [Op.notIn]: ['concluido', 'cancelado'] },
        dataSolicitacao: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
      include: [
        { model: Usuario, required: true },
        { model: Servico, required: true },
      ],
      order: [['dataSolicitacao', 'ASC']],
    });

    const casosVencimento = emAberto.map((s) => {
      const tempoEstimado = s.servico?.prazoEstimadoDias ?? 0;
      const dataInicio = new Date(s.dataSolicitacao);
      const dataVencimento = addDays(dataInicio, tempoEstimado);
      return {
        idUsuario: s.usuarioId,
        usuario: s.usuario?.nome ?? '—',
        servico: s.servico?.nome ?? '—',
        dataInicio,
        tempoEstimado,
        dataVencimento,
      };
    });

    return {
      tempoMedio,
      comparativo,
      casosVencimento,
    };
  }

  async getCasosEmVencimento(inicio: Date, fim: Date) {
    const { casosVencimento } = await this.getTempoMedioConclusao(inicio, fim);
    return casosVencimento.sort(
      (a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime(),
    );
  }

  async getFunilConversao(inicio: Date, fim: Date) {
    const solicitacoes = await this.solicitacaoModel.findAll({
      where: {
        dataSolicitacao: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
      include: [
        { model: Servico, required: true },
        { model: Usuario, required: true },
      ],
      order: [['dataSolicitacao', 'ASC']],
    });

    const porServicoMap = new Map<
      string,
      { nome: string; concluidas: number; total: number }
    >();

    for (const s of solicitacoes) {
      const nome = s.servico?.nome ?? '—';
      const current = porServicoMap.get(nome) ?? {
        nome,
        concluidas: 0,
        total: 0,
      };
      current.total += 1;
      if (s.status === 'concluido') current.concluidas += 1;
      porServicoMap.set(nome, current);
    }

    const porServico = [...porServicoMap.values()].sort(
      (a, b) => b.concluidas - a.concluidas,
    );
    const totalConcluidas = solicitacoes.filter((s) => s.status === 'concluido').length;
    const naoConvertidas = solicitacoes.filter(
      (s) => s.status !== 'concluido' && s.status !== 'cancelado',
    );

    return { totalConcluidas, porServico, naoConvertidas };
  }

  async getGargalos(inicio: Date, fim: Date) {
    const solicitacoes = await this.solicitacaoModel.findAll({
      where: {
        dataSolicitacao: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
      include: [
        { model: Servico, required: true },
        { model: Usuario, required: true },
      ],
      order: [['dataSolicitacao', 'ASC']],
    });

    const paradas = solicitacoes.filter(
      (s) => !['concluido', 'cancelado'].includes(s.status),
    );
    const hoje = new Date();

    const paradasComTempo = paradas.map((s) => {
      const diasDecorridos = Math.max(
        0,
        Math.round((hoje.getTime() - new Date(s.dataSolicitacao).getTime()) / 86400000),
      );
      return {
        id: s.id,
        servico: s.servico?.nome ?? '—',
        status: s.status,
        diasDecorridos,
        prazoEstimado: s.servico?.prazoEstimadoDias ?? 0,
      };
    });

    const concluidas = solicitacoes.filter((s) => s.status === 'concluido' && s.dataConclusao);
    const tempoAcimaMap = new Map<
      string,
      { servico: string; totalDias: number; count: number; prazoEstimado: number }
    >();

    for (const s of concluidas) {
      const usado = Math.max(
        0,
        Math.round(
          (new Date(s.dataConclusao as Date).getTime() -
            new Date(s.dataSolicitacao).getTime()) /
            86400000,
        ),
      );
      const prazo = s.servico?.prazoEstimadoDias ?? 0;
      if (usado > prazo) {
        const nome = s.servico?.nome ?? '—';
        const current = tempoAcimaMap.get(nome) ?? {
          servico: nome,
          totalDias: 0,
          count: 0,
          prazoEstimado: prazo,
        };
        current.totalDias += usado;
        current.count += 1;
        current.prazoEstimado = prazo;
        tempoAcimaMap.set(nome, current);
      }
    }

    const tempoAcima = [...tempoAcimaMap.values()]
      .map((t) => ({
        servico: t.servico,
        tempoMedio: Math.round(t.totalDias / t.count),
        prazoEstimado: t.prazoEstimado,
      }))
      .sort((a, b) => b.tempoMedio - a.tempoMedio);

    const acumuloStatus: Record<string, number> = {};
    for (const status of STATUS_SOLICITACAO) acumuloStatus[status] = 0;
    for (const s of solicitacoes) {
      acumuloStatus[s.status] = (acumuloStatus[s.status] ?? 0) + 1;
    }

    const docsPendentes = await this.documentoModel.findAll({
      where: {
        statusValidacao: 'pendente',
        dataUpload: { [Op.between]: [startOfDay(inicio), endOfDay(fim)] },
      },
      include: [
        {
          model: Solicitacao,
          required: true,
          include: [
            { model: Usuario, required: true },
            { model: Servico, required: true },
          ],
        },
      ],
      order: [['dataUpload', 'ASC']],
    });

    const clientesTravando = paradas
      .filter((s) => s.status === 'aguardando_documento')
      .map((s) => ({
        id: s.id,
        usuario: s.usuario,
        servico: s.servico,
        status: s.status,
        dataSolicitacao: s.dataSolicitacao,
      }));

    return {
      paradasComTempo,
      tempoAcima,
      acumuloStatus,
      docsPendentes,
      clientesTravando,
    };
  }
}
