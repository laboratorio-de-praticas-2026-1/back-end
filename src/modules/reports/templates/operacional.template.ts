import { fmtBRL, fmtDate, badge } from './base.template';
import { ReportTemplateRendererService } from '../report-template-renderer.service';

function render(template: string, context: Record<string, unknown>): string {
  return ReportTemplateRendererService.render(
    `operacional/${template}`,
    context,
  );
}

export function servicosPrestadosSection(servicos: any[]): string {
  return render('servicos-prestados.ejs', { servicos, fmtBRL });
}

export function servicosPrestadosTabelaSection(
  servicos: any[],
  options?: { titulo?: string },
): string {
  return render('servicos-prestados.ejs', {
    servicos,
    fmtBRL,
    titulo: options?.titulo,
  });
}

export function solicitacoesPorServicoSection(
  dados: { nome: string; total: number }[],
  pieBase64: string,
): string {
  return render('solicitacoes-por-servico.ejs', { dados, pieBase64 });
}

export function solicitacoesResumoSection(
  total: number,
  porStatus: Record<string, number>,
): string {
  const statusLabels: Record<string, string> = {
    recebido: 'Recebidas',
    aguardando_pagamento: 'Ag. Pagamento',
    aguardando_documento: 'Ag. Documento',
    em_andamento: 'Em Andamento',
    concluido: 'Concluídas',
    cancelado: 'Canceladas',
  };

  return render('solicitacoes-resumo.ejs', {
    total,
    porStatus,
    statusLabels,
  });
}

export function solicitacoesGraficoSection(pieBase64: string): string {
  return render('solicitacoes-grafico.ejs', { pieBase64 });
}

export function todasSolicitacoesSection(
  solicitacoes: any[],
  options?: { titulo?: string; startIndex?: number },
): string {
  return render('todas-solicitacoes.ejs', {
    solicitacoes,
    badge,
    fmtDate,
    titulo: options?.titulo,
    startIndex: options?.startIndex ?? 0,
  });
}

export function documentosSection(
  total: number,
  porStatus: Record<string, number>,
  pieBase64: string,
): string {
  return render('documentos-resumo.ejs', { total, porStatus, pieBase64 });
}

export function documentosListSection(docs: any[], titulo: string): string {
  return render('documentos-list.ejs', { docs, titulo, badge, fmtDate });
}

export function veiculosSection(
  totalVeiculos: number,
  debitosVeiculos: any[],
): string {
  return render('veiculos.ejs', { totalVeiculos, debitosVeiculos, fmtBRL });
}

export function veiculosTabelaSection(
  totalVeiculos: number,
  debitosVeiculos: any[],
  options?: { showResumo?: boolean; tableTitle?: string },
): string {
  return render('veiculos.ejs', {
    totalVeiculos,
    debitosVeiculos,
    fmtBRL,
    showResumo: options?.showResumo,
    tableTitle: options?.tableTitle,
  });
}

export function clientesSection(
  clientes: any[],
  total: number,
  taxaConversao: number,
  parcelasAtrasadas: any[],
): string {
  return render('clientes.ejs', {
    clientes,
    total,
    taxaConversao,
    parcelasAtrasadas,
    novosNoPeriodo: clientes.length,
    fmtDate,
    fmtBRL,
  });
}

export function clientesTabelaSection(
  clientes: any[],
  total: number,
  taxaConversao: number,
  parcelasAtrasadas: any[],
  options?: {
    showResumo?: boolean;
    showCadastrados?: boolean;
    showAtrasadas?: boolean;
    cadastradosTitle?: string;
    atrasadasTitle?: string;
    novosNoPeriodo?: number;
  },
): string {
  return render('clientes.ejs', {
    clientes,
    total,
    taxaConversao,
    parcelasAtrasadas,
    novosNoPeriodo: options?.novosNoPeriodo ?? clientes.length,
    fmtDate,
    fmtBRL,
    showResumo: options?.showResumo,
    showCadastrados: options?.showCadastrados,
    showAtrasadas: options?.showAtrasadas,
    cadastradosTitle: options?.cadastradosTitle,
    atrasadasTitle: options?.atrasadasTitle,
  });
}

export function tempoMedioSection(
  tempoMedio: number,
  comparativo: any[],
  casosVencimento: any[],
): string {
  return render('tempo-medio.ejs', {
    tempoMedio,
    comparativo,
    casosVencimento,
    fmtDate,
  });
}

export function tempoMedioTabelaSection(
  tempoMedio: number,
  comparativo: any[],
  casosVencimento: any[],
  options?: {
    showResumo?: boolean;
    showComparativo?: boolean;
    showVencimento?: boolean;
    comparativoTitle?: string;
    vencimentoTitle?: string;
  },
): string {
  return render('tempo-medio.ejs', {
    tempoMedio,
    comparativo,
    casosVencimento,
    fmtDate,
    showResumo: options?.showResumo,
    showComparativo: options?.showComparativo,
    showVencimento: options?.showVencimento,
    comparativoTitle: options?.comparativoTitle,
    vencimentoTitle: options?.vencimentoTitle,
  });
}

export function funilConversaoSection(
  totalConcluidas: number,
  porServico: any[],
  naoConvertidas: any[],
  pieBase64: string,
): string {
  return render('funil-conversao.ejs', {
    totalConcluidas,
    porServico,
    naoConvertidas,
    pieBase64,
    badge,
    fmtDate,
  });
}

export function funilConversaoTabelaSection(
  totalConcluidas: number,
  porServico: any[],
  naoConvertidas: any[],
  pieBase64: string,
  options?: {
    showResumoGrafico?: boolean;
    showTabela?: boolean;
    tabelaTitle?: string;
  },
): string {
  return render('funil-conversao.ejs', {
    totalConcluidas,
    porServico,
    naoConvertidas,
    pieBase64,
    badge,
    fmtDate,
    showResumoGrafico: options?.showResumoGrafico,
    showTabela: options?.showTabela,
    tabelaTitle: options?.tabelaTitle,
  });
}

export function gargalosSection(gargalos: {
  paradasComTempo: any[];
  tempoAcima: any[];
  acumuloStatus: Record<string, number>;
  docsPendentes: any[];
  clientesTravando: any[];
  acumuloPieBase64: string;
}): string {
  return render('gargalos.ejs', { gargalos, badge, fmtDate });
}

export function gargalosTabelaSection(
  gargalos: {
    paradasComTempo: any[];
    tempoAcima: any[];
    acumuloStatus: Record<string, number>;
    docsPendentes: any[];
    clientesTravando: any[];
    acumuloPieBase64: string;
  },
  options?: {
    showParadas?: boolean;
    showTempoAcima?: boolean;
    showAcumulo?: boolean;
    showDocs?: boolean;
    showClientes?: boolean;
    paradasTitle?: string;
    tempoAcimaTitle?: string;
    docsTitle?: string;
    clientesTitle?: string;
  },
): string {
  return render('gargalos.ejs', {
    gargalos,
    badge,
    fmtDate,
    showParadas: options?.showParadas,
    showTempoAcima: options?.showTempoAcima,
    showAcumulo: options?.showAcumulo,
    showDocs: options?.showDocs,
    showClientes: options?.showClientes,
    paradasTitle: options?.paradasTitle,
    tempoAcimaTitle: options?.tempoAcimaTitle,
    docsTitle: options?.docsTitle,
    clientesTitle: options?.clientesTitle,
  });
}
