import { fmtBRL, fmtDate, badge } from './base.template';

type DebitoTabelaRow = {
  tipo: string;
  valor: number | string;
  status: string;
  debitoServico?: {
    servico?: {
      nome?: string | null;
    } | null;
  } | null;
  debitoVeiculo?: {
    veiculo?: {
      placa?: string | null;
    } | null;
  } | null;
};

type ParcelaTabelaRow = {
  id: number | string;
  idPagamento: number | string;
  valor: number | string;
  numeroParcela: number | string;
  status: string;
  vencimento: Date | string | null;
  pagamento?: {
    qtdParcelas?: number | string | null;
  } | null;
};

type FluxoRecebimentoRow = {
  id: number | string;
  idDebito: number | string;
  valorTotal: number | string;
  qtdParcelas: number | string;
  tipoPagamento: string;
  metodoPagamento: string;
  taxa: number | string;
};

type RankingArrecadacaoRow = {
  top: number;
  nome: string;
  total: number;
};

// SEÇÃO: Indicadores Financeiros
export function financialSummarySection(data: {
  totalArrecadado: number;
  totalTaxas: number;
  totalPendente: number;
  faturamentoComTaxa: number;
  faturamentoDiluido: { semana: string; valor: number }[];
  metodosPagamento: Record<string, number>;
  lineChartBase64: string;
  pieChartBase64: string;
}): string {
  const { totalArrecadado, totalTaxas, totalPendente, faturamentoComTaxa } =
    data;

  return /* html */ `
  <div class="section-label">Financeiro — Resumo do Período</div>

  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Total Arrecadado</div>
      <div class="kpi-value">${fmtBRL(totalArrecadado)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total de Taxas Cobradas</div>
      <div class="kpi-value">${fmtBRL(totalTaxas)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Débitos Pendentes</div>
      <div class="kpi-value">${fmtBRL(totalPendente)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Faturamento com Taxa</div>
      <div class="kpi-value">${fmtBRL(faturamentoComTaxa)}</div>
    </div>
  </div>

  <div class="section-label">Faturamento Diluído no Período</div>
  <div class="chart-wrap">
    <img src="${data.lineChartBase64}" style="width:100%;max-height:220px;object-fit:contain;" />
  </div>

  <div class="section-label">Métodos de Pagamento</div>
  <div class="chart-wrap">
    <img src="${data.pieChartBase64}" style="width:380px;" />
  </div>
`;
}

export function financialPartOneContent(data: {
  totalArrecadado: number;
  totalTaxas: number;
  totalPendente: number;
  faturamentoComTaxa: number;
  faturamentoDiluido: { semana: string; valor: number }[];
  metodosPagamento: Record<string, number>;
  lineChartBase64: string;
  pieChartBase64: string;
}): string {
  return /* html */ `
  <div style="margin-bottom:12px;color:#5D6D7E;font-size:11px;">
    Visão executiva do período com indicadores, tendência de faturamento e distribuição dos meios de pagamento.
  </div>
  ${financialSummarySection(data)}
`;
}

export function debitosTableSection(debitos: DebitoTabelaRow[]): string {
  const rows = debitos
    .map(
      (d, i) => /* html */ `
    <tr>
      <td>${String(i + 1).padStart(2, '0')}</td>
      <td>${d.tipo === 'servico' ? 'Serviço' : 'Veículo'}</td>
      <td>${d.debitoServico?.servico?.nome ?? d.debitoVeiculo?.veiculo?.placa ?? '—'}</td>
      <td>${fmtBRL(Number(d.valor))}</td>
      <td>${badge(d.status)}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Todos os Débitos</div>
  <table>
    <thead><tr>
      <th>#</th><th>Tipo</th><th>Descrição</th><th>Valor</th><th>Status</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="5" style="text-align:center;color:#999;">Nenhum débito encontrado</td></tr>'}</tbody>
  </table>`;
}

export function parcelasVencer30Section(parcelas: ParcelaTabelaRow[]): string {
  const rows = parcelas
    .map(
      (p) => /* html */ `
    <tr>
      <td>${p.id}</td>
      <td>${p.idPagamento}</td>
      <td>${fmtBRL(Number(p.valor))}</td>
      <td>${p.numeroParcela}/${p.pagamento?.qtdParcelas ?? '?'}</td>
      <td>${badge(p.status)}</td>
      <td>${fmtDate(p.vencimento)}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Parcelas a Vencer nos Próximos 30 Dias</div>
  <table>
    <thead><tr>
      <th>ID</th><th>ID Pgto</th><th>Valor</th><th>Parcela</th><th>Status</th><th>Vencimento</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#999;">Sem parcelas a vencer</td></tr>'}</tbody>
  </table>`;
}

export function fluxoRecebimentoSection(
  pagamentos: FluxoRecebimentoRow[],
): string {
  const rows = pagamentos
    .map(
      (p) => /* html */ `
    <tr>
      <td>${p.id}</td>
      <td>${p.idDebito}</td>
      <td>${fmtBRL(Number(p.valorTotal))}</td>
      <td>${p.qtdParcelas}</td>
      <td>${p.tipoPagamento === 'avista' ? 'À Vista' : 'Parcelado'}</td>
      <td>${p.metodoPagamento}</td>
      <td>${fmtBRL(Number(p.taxa))}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Fluxo de Recebimento</div>
  <table>
    <thead><tr>
      <th>ID</th><th>ID Déb.</th><th>Valor Total</th><th>Parcelas</th>
      <th>Tipo Pgto</th><th>Método</th><th>Taxa</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="7" style="text-align:center;color:#999;">Nenhum pagamento encontrado</td></tr>'}</tbody>
  </table>`;
}

export function detalheParcelas(
  parcelas: ParcelaTabelaRow[],
  vencidas: ParcelaTabelaRow[],
  options?: { showResumo?: boolean },
): string {
  const valorVencido = vencidas.reduce((a, p) => a + Number(p.valor), 0);
  // Group unique payers from vencidas
  const devedores = new Set(vencidas.map((p) => p.idPagamento)).size;
  const showResumo = options?.showResumo !== false;

  const rows = parcelas
    .map(
      (p) => /* html */ `
    <tr>
      <td>${p.id}</td>
      <td>${p.idPagamento}</td>
      <td>${fmtBRL(Number(p.valor))}</td>
      <td>${p.numeroParcela}</td>
      <td>${badge(p.status)}</td>
      <td>${fmtDate(p.vencimento)}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Detalhamento de Parcelas</div>
  ${
    showResumo
      ? `<div class="kpi-row" style="margin-bottom:12px;">
    <div class="kpi-card">
      <div class="kpi-label">Total Vencido (não pago ou próximo de vencer)</div>
      <div class="kpi-value" style="color:#E65C4F;">${fmtBRL(valorVencido)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Clientes Inadimplentes</div>
      <div class="kpi-value" style="color:#E65C4F;">${devedores}</div>
    </div>
  </div>`
      : ''
  }
  <table>
    <thead><tr>
      <th>ID</th><th>ID Pgto</th><th>Valor</th><th>Nº Parcela</th><th>Status</th><th>Vencimento</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#999;">Nenhuma parcela encontrada</td></tr>'}</tbody>
  </table>`;
}

export function arrecadacaoPorServico(
  ranking: RankingArrecadacaoRow[],
): string {
  const rows = ranking
    .map(
      (r) => /* html */ `
    <tr>
      <td style="font-weight:700;color:#1B2B4B;">${r.top}º</td>
      <td>${r.nome}</td>
      <td>${fmtBRL(r.total)}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Arrecadação por Serviço</div>
  <table>
    <thead><tr><th>Rank</th><th>Serviço</th><th>Valor Total</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="3" style="text-align:center;color:#999;">Sem dados</td></tr>'}</tbody>
  </table>`;
}

export function financialPartTwoContent(params: {
  debitos: DebitoTabelaRow[];
  parcelas30: ParcelaTabelaRow[];
  fluxo: FluxoRecebimentoRow[];
  parcelas: ParcelaTabelaRow[];
  vencidas: ParcelaTabelaRow[];
  ranking: RankingArrecadacaoRow[];
}): string {
  const { debitos, parcelas30, fluxo, parcelas, vencidas, ranking } = params;

  return /* html */ `
  <style>
    .fin-part2-block { margin-bottom: 22px; }
    .fin-part2-block:last-child { margin-bottom: 0; }
    .fin-part2-block .section-label { margin-top: 0; margin-bottom: 12px; }
  </style>
  <div style="margin-bottom:12px;color:#5D6D7E;font-size:11px;">
    Detalhamento financeiro para acompanhamento operacional e cobrança.
  </div>
  <div class="fin-part2-block">${debitosTableSection(debitos)}</div>
  <div class="fin-part2-block">${parcelasVencer30Section(parcelas30)}</div>
  <div class="fin-part2-block">${fluxoRecebimentoSection(fluxo)}</div>
  <div class="fin-part2-block">${detalheParcelas(parcelas, vencidas)}</div>
  <div class="fin-part2-block">${arrecadacaoPorServico(ranking)}</div>
`;
}
