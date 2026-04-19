import { fmtBRL, fmtDate, badge } from './base.template';

export function servicosPrestadosSection(servicos: any[]): string {
  const rows = servicos
    .map(
      (s) => /* html */ `
    <tr>
      <td>${s.id}</td>
      <td>${s.nome}</td>
      <td style="font-size:10px;max-width:200px;">${s.descricao ?? '—'}</td>
      <td>${s.valorBase ? fmtBRL(Number(s.valorBase)) : '—'}</td>
      <td>${s.prazoEstimadoDias ?? '—'} dias</td>
      <td>${s.ativo ? '<span class="ok-icon">✓ Sim</span>' : '<span class="nok-icon">✗ Não</span>'}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Serviços Prestados</div>
  <table>
    <thead><tr>
      <th>ID</th><th>Serviço</th><th>Descrição</th><th>Valor Base</th><th>Prazo</th><th>Ativo</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function solicitacoesPorServicoSection(
  dados: { nome: string; total: number }[],
  pieBase64: string,
): string {
  return /* html */ `
  <div class="section-label">Qtd. de Solicitações por Serviço</div>
  <div class="chart-wrap">
    <img src="${pieBase64}" style="width:400px;" />
  </div>`;
}

export function solicitacoesResumoSection(
  total: number,
  porStatus: Record<string, number>,
  pieBase64: string,
): string {
  const statusLabels: Record<string, string> = {
    recebido: 'Recebidas',
    aguardando_pagamento: 'Ag. Pagamento',
    aguardando_documento: 'Ag. Documento',
    em_andamento: 'Em Andamento',
    concluido: 'Concluídas',
    cancelado: 'Canceladas',
  };

  const kpis = Object.entries(porStatus)
    .map(
      ([k, v]) => /* html */ `
    <div class="kpi-card">
      <div class="kpi-label">${statusLabels[k] ?? k}</div>
      <div class="kpi-value">${v}</div>
    </div>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Solicitações — Resumo</div>
  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Total de Solicitações</div>
      <div class="kpi-value">${total}</div>
    </div>
    ${kpis}
  </div>
  <div class="chart-wrap">
    <img src="${pieBase64}" style="width:380px;" />
  </div>`;
}

export function todasSolicitacoesSection(solicitacoes: any[]): string {
  const rows = solicitacoes
    .map(
      (s, i) => /* html */ `
    <tr>
      <td>${String(i + 1).padStart(2, '0')}</td>
      <td>${s.servico.nome}</td>
      <td>${badge(s.status)}</td>
      <td style="font-size:10px;max-width:120px;">${s.observacaoCliente ?? '—'}</td>
      <td style="font-size:10px;max-width:120px;">${s.observacaoAdmin ?? '—'}</td>
      <td>${fmtDate(s.dataSolicitacao)}</td>
      <td>${fmtDate(s.dataConclusao)}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Todas as Solicitações do Período</div>
  <table>
    <thead><tr>
      <th>#</th><th>Serviço</th><th>Status</th>
      <th>Obs. Cliente</th><th>Obs. Admin</th>
      <th>Data Solic.</th><th>Data Conclusão</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="7" style="text-align:center;color:#999;">Nenhuma solicitação</td></tr>'}</tbody>
  </table>`;
}

export function documentosSection(
  total: number,
  porStatus: Record<string, number>,
  pieBase64: string,
): string {
  return /* html */ `
  <div class="section-label">Documentos — Resumo</div>
  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Total de Documentos</div>
      <div class="kpi-value">${total}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Pendentes</div>
      <div class="kpi-value" style="color:#856404;">${porStatus['pendente'] ?? 0}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Aprovados</div>
      <div class="kpi-value" style="color:#1A5E2E;">${porStatus['aprovado'] ?? 0}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Rejeitados</div>
      <div class="kpi-value" style="color:#842029;">${porStatus['rejeitado'] ?? 0}</div>
    </div>
  </div>
  <div class="chart-wrap">
    <img src="${pieBase64}" style="width:350px;" />
  </div>`;
}

export function documentosListSection(docs: any[], titulo: string): string {
  const rows = docs
    .map(
      (d) => /* html */ `
    <tr>
      <td>${d.id}</td>
      <td>${d.tipoDocumento ?? '—'}</td>
      <td>${d.solicitacao?.usuario?.nome ?? '—'}</td>
      <td>${d.solicitacao?.servico?.nome ?? '—'}</td>
      <td>${badge(d.statusValidacao)}</td>
      <td>${fmtDate(d.dataUpload)}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">${titulo}</div>
  <table>
    <thead><tr>
      <th>ID</th><th>Tipo</th><th>Cliente</th><th>Serviço</th><th>Status</th><th>Data Upload</th>
    </tr></thead>
    <tbody>${rows || `<tr><td colspan="6" style="text-align:center;color:#999;">Nenhum documento ${titulo.toLowerCase()}</td></tr>`}</tbody>
  </table>`;
}

export function veiculosSection(totalVeiculos: number, debitosVeiculos: any[]): string {
  const rows = debitosVeiculos
    .filter((dv) => dv.debito && dv.debito.status === 'pendente')
    .map(
      (dv) => /* html */ `
    <tr>
      <td>${dv.veiculo?.placa ?? '—'}</td>
      <td>${dv.veiculo?.usuario?.nome ?? '—'}</td>
      <td>${fmtBRL(Number(dv.debito.valor))}</td>
      <td>${dv.debito.pagamento?.metodoPagamento ?? '—'}</td>
      <td>${dv.debito.pagamento?.tipoPagamento ?? '—'}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Veículos</div>
  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Volume Total de Veículos</div>
      <div class="kpi-value">${totalVeiculos}</div>
    </div>
  </div>
  <div class="section-label">Veículos com Débitos Pendentes</div>
  <table>
    <thead><tr>
      <th>Placa</th><th>Usuário</th><th>Valor</th><th>Método Pgto</th><th>Tipo Pgto</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="5" style="text-align:center;color:#999;">Nenhum veículo com débito pendente</td></tr>'}</tbody>
  </table>`;
}

export function clientesSection(
  clientes: any[],
  total: number,
  taxaConversao: number,
  parcelasAtrasadas: any[],
): string {
  const clienteRows = clientes
    .map(
      (c) => /* html */ `
    <tr>
      <td>${c.nome}</td>
      <td>${c.veiculos?.length ?? 0}</td>
      <td>${fmtDate(c.dataCadastro)}</td>
      <td>${c.solicitacoes?.length ?? 0}</td>
    </tr>`,
    )
    .join('');

  const parcelasRows = parcelasAtrasadas
    .map(
      (p) => /* html */ `
    <tr>
      <td>${p.nome}</td>
      <td>${p.numParcelas}</td>
      <td>${fmtBRL(Number(p.valorParcelas))}</td>
      <td>${fmtDate(p.dataInicio)}</td>
      <td>${fmtDate(p.dataVenc)}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Clientes</div>
  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Total de Clientes (sistema)</div>
      <div class="kpi-value">${total}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Novos no Período</div>
      <div class="kpi-value">${clientes.length}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Taxa de Conversão</div>
      <div class="kpi-value">${taxaConversao}%</div>
    </div>
  </div>

  <div class="section-label">Cadastrados no Período</div>
  <table>
    <thead><tr>
      <th>Nome</th><th>Veículos</th><th>Data Cadastro</th><th>Solicitações</th>
    </tr></thead>
    <tbody>${clienteRows || '<tr><td colspan="4" style="text-align:center;color:#999;">Nenhum cliente no período</td></tr>'}</tbody>
  </table>

  <div class="section-label">Clientes com Parcelas em Atraso</div>
  <table>
    <thead><tr>
      <th>Cliente</th><th>Num. Parcelas</th><th>Valor Parcelas</th><th>Data Início</th><th>Vencimento</th>
    </tr></thead>
    <tbody>${parcelasRows || '<tr><td colspan="5" style="text-align:center;color:#999;">Nenhuma parcela em atraso</td></tr>'}</tbody>
  </table>`;
}

export function tempoMedioSection(
  tempoMedio: number,
  comparativo: any[],
  casosVencimento: any[],
): string {
  const compRows = comparativo
    .map(
      (c) => /* html */ `
    <tr>
      <td>${c.id}</td>
      <td>${c.servico}</td>
      <td>${c.tempoUtilizado} dias</td>
      <td>${c.prazoEstimado} dias</td>
      <td>${c.dentroPrazo ? '<span class="ok-icon">✓ Sim</span>' : '<span class="nok-icon">✗ Não</span>'}</td>
    </tr>`,
    )
    .join('');

  const vencRows = casosVencimento
    .map(
      (c) => /* html */ `
    <tr>
      <td>${c.idUsuario}</td>
      <td>${c.usuario}</td>
      <td>${c.servico}</td>
      <td>${fmtDate(c.dataInicio)}</td>
      <td>${c.tempoEstimado} dias</td>
      <td>${fmtDate(c.dataVencimento)}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Tempo Médio de Conclusão</div>
  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Tempo Médio Geral</div>
      <div class="kpi-value">${tempoMedio} dias</div>
    </div>
  </div>

  <div class="section-label">Tempo Médio × Prazo Estimado</div>
  <table>
    <thead><tr>
      <th>ID</th><th>Serviço</th><th>Tempo Utilizado</th><th>Prazo Estimado</th><th>Dentro do Prazo?</th>
    </tr></thead>
    <tbody>${compRows || '<tr><td colspan="5" style="text-align:center;color:#999;">Nenhuma solicitação concluída</td></tr>'}</tbody>
  </table>

  <div class="section-label">Casos em Vencimento</div>
  <table>
    <thead><tr>
      <th>ID Usuário</th><th>Usuário</th><th>Serviço</th>
      <th>Data Início</th><th>Tempo Est.</th><th>Data Venc.</th>
    </tr></thead>
    <tbody>${vencRows || '<tr><td colspan="6" style="text-align:center;color:#999;">Nenhum caso em vencimento</td></tr>'}</tbody>
  </table>`;
}

export function funilConversaoSection(
  totalConcluidas: number,
  porServico: any[],
  naoConvertidas: any[],
  pieBase64: string,
): string {
  const naoConvRows = naoConvertidas
    .map(
      (s) => /* html */ `
    <tr>
      <td>${s.id}</td>
      <td>${s.servico?.nome ?? '—'}</td>
      <td>${s.usuario?.nome ?? '—'}</td>
      <td>${badge(s.status)}</td>
      <td>${fmtDate(s.dataSolicitacao)}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Funil de Conversão (Solicitação → Conclusão)</div>
  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-label">Solicitações Concluídas</div>
      <div class="kpi-value">${totalConcluidas}</div>
    </div>
  </div>
  <div class="chart-wrap">
    <img src="${pieBase64}" style="width:380px;" />
  </div>

  <div class="section-label">Solicitações Não Convertidas</div>
  <table>
    <thead><tr>
      <th>ID</th><th>Serviço</th><th>Cliente</th><th>Status</th><th>Data Solic.</th>
    </tr></thead>
    <tbody>${naoConvRows || '<tr><td colspan="5" style="text-align:center;color:#999;">Nenhuma solicitação pendente</td></tr>'}</tbody>
  </table>`;
}

export function gargalosSection(gargalos: {
  paradasComTempo: any[];
  tempoAcima: any[];
  acumuloStatus: Record<string, number>;
  docsPendentes: any[];
  clientesTravando: any[];
  acumuloPieBase64: string;
}): string {
  const paradasRows = gargalos.paradasComTempo
    .map(
      (s) => /* html */ `
    <tr>
      <td>${s.id}</td>
      <td>${s.servico}</td>
      <td>${badge(s.status)}</td>
      <td>${s.diasDecorridos} dias</td>
      <td>${s.prazoEstimado} dias</td>
    </tr>`,
    )
    .join('');

  const tempoAcimaRows = gargalos.tempoAcima
    .map(
      (t) => /* html */ `
    <tr>
      <td>${t.servico}</td>
      <td>${t.tempoMedio} dias</td>
      <td>${t.prazoEstimado} dias</td>
    </tr>`,
    )
    .join('');

  const docsPendRows = gargalos.docsPendentes
    .map(
      (d) => /* html */ `
    <tr>
      <td>${d.id}</td>
      <td>${d.tipoDocumento ?? '—'}</td>
      <td>${d.solicitacao?.usuario?.nome ?? '—'}</td>
      <td>${d.solicitacao?.servico?.nome ?? '—'}</td>
      <td>${fmtDate(d.dataUpload)}</td>
    </tr>`,
    )
    .join('');

  const clientesTravRows = gargalos.clientesTravando
    .map(
      (s) => /* html */ `
    <tr>
      <td>${s.id}</td>
      <td>${s.usuario?.nome ?? '—'}</td>
      <td>${s.servico?.nome ?? '—'}</td>
      <td>${badge(s.status)}</td>
      <td>${fmtDate(s.dataSolicitacao)}</td>
    </tr>`,
    )
    .join('');

  return /* html */ `
  <div class="section-label">Solicitações Paradas</div>
  <table>
    <thead><tr>
      <th>ID</th><th>Serviço</th><th>Status</th><th>Dias Decorridos</th><th>Prazo Estimado</th>
    </tr></thead>
    <tbody>${paradasRows || '<tr><td colspan="5" style="text-align:center;color:#999;">Nenhuma solicitação parada</td></tr>'}</tbody>
  </table>

  <div class="section-label">Tempo Acima do Esperado por Serviço</div>
  <table>
    <thead><tr><th>Serviço</th><th>Tempo Médio</th><th>Prazo Estimado</th></tr></thead>
    <tbody>${tempoAcimaRows || '<tr><td colspan="3" style="text-align:center;color:#999;">Nenhum serviço acima do prazo</td></tr>'}</tbody>
  </table>

  <div class="section-label">Acúmulo por Status</div>
  <div class="chart-wrap">
    <img src="${gargalos.acumuloPieBase64}" style="width:380px;" />
  </div>

  <div class="section-label">Documentos Pendentes</div>
  <table>
    <thead><tr>
      <th>ID</th><th>Tipo</th><th>Cliente</th><th>Serviço</th><th>Data Upload</th>
    </tr></thead>
    <tbody>${docsPendRows || '<tr><td colspan="5" style="text-align:center;color:#999;">Nenhum documento pendente</td></tr>'}</tbody>
  </table>

  <div class="section-label">Clientes Travando o Fluxo</div>
  <table>
    <thead><tr>
      <th>ID</th><th>Cliente</th><th>Serviço</th><th>Status</th><th>Data Solic.</th>
    </tr></thead>
    <tbody>${clientesTravRows || '<tr><td colspan="5" style="text-align:center;color:#999;">Nenhum cliente travando</td></tr>'}</tbody>
  </table>`;
}
