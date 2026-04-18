import { fmtBRL, fmtDate, badge } from './base.template';

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
  const { totalArrecadado, totalTaxas, totalPendente, faturamentoComTaxa } = data;

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

export function debitosTableSection(debitos: any[]): string {
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

export function parcelasVencer30Section(parcelas: any[]): string {
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

export function fluxoRecebimentoSection(pagamentos: any[]): string {
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

export function detalheParcelas(parcelas: any[], vencidas: any[]): string {
  const valorVencido = vencidas.reduce((a, p) => a + Number(p.valor), 0);
  // Group unique payers from vencidas  
  const devedores = new Set(vencidas.map((p) => p.idPagamento)).size;

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
  <div class="kpi-row" style="margin-bottom:12px;">
    <div class="kpi-card">
      <div class="kpi-label">Total Vencido (não pago)</div>
      <div class="kpi-value" style="color:#C0392B;">${fmtBRL(valorVencido)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Clientes Inadimplentes</div>
      <div class="kpi-value" style="color:#C0392B;">${devedores}</div>
    </div>
  </div>
  <table>
    <thead><tr>
      <th>ID</th><th>ID Pgto</th><th>Valor</th><th>Nº Parcela</th><th>Status</th><th>Vencimento</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#999;">Nenhuma parcela encontrada</td></tr>'}</tbody>
  </table>`;
}

export function arrecadacaoPorServico(ranking: any[]): string {
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
