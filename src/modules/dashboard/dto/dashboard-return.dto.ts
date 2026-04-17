export class HistoricoMensalDto {
  mes!: string;
  receitaRealizada!: number;
}

export class InadimplenciaDto {
  valorTotal!: number;
  quantidadePagamentos!: number;
  quantidadeParcelas!: number;
}

export class PrevisaoCaixa30DiasDto {
  valorTotal!: number;
  quantidadeParcelas!: number;
}

export class PorMetodoPagamentoDto {
  metodo!: string;
  quantidade!: number;
  valorTotal!: number;
}

export class PorTipoPagamentoDto {
  tipo!: 'avista' | 'parcelado';
  quantidade!: number;
  valorTotal!: number;
}

export class FinanceiroDto {
  receitaRealizada!: number;

  receitaPendente!: number;

  receitaTaxa!: number;

  ticketMedio!: number;

  mediaMensalReceita!: number;

  historicoMensal!: HistoricoMensalDto[];

  inadimplencia!: InadimplenciaDto;

  previsaoCaixa30Dias!: PrevisaoCaixa30DiasDto;

  porMetodoPagamento!: PorMetodoPagamentoDto[];

  porTipoPagamento!: PorTipoPagamentoDto[];
}

export class SolicitacoesDto {
  porStatus!: {
    recebido: number;
    emAndamento: number;
    aguardandoPagamento: number;
    aguardandoDocumento: number;
    concluido: number;
    cancelado: number;
  };
  proximasDeVencer!: {
    quantidade: number;
  };
  tempoConclusaoPorServico!: {
    servicoId: number;
    servicoNome: string;
    prazoEstimadoDias: number;
    mediaRealDias: number;
    totalConcluidas: number;
  }[];
  foraDoPrazo!: {
    quantidade: number;
    totalConcluidas: number;
    percentual: number;
  };
}

export class ServicosDto {
  ativos!: number;
  pausados!: number;
  maisSolicitados!: {
    servicoId: number;
    nome: string;
    totalSolicitacoes: number;
  }[];
  receitaPorServicoCompleto!: {
    servicoId: number;
    nome: string;
    totalSolicitacoes: number;
    receitaTotal: number;
  }[];
}

export class GeralDto {
  solicitacoesEmAberto!: number;
  solicitacoesConcluidas!: number;
  documentosPendentesValidacao!: number;
  clientesNovosMesAtual!: number;
  taxaCancelamentoPct!: number;
  debitosEmAberto!: {
    quantidade: number;
    valorTotal: number;
  };
  parcelasVencidasNaoPagas!: {
    quantidade: number;
    valorTotal: number;
  };
}

export class DashboardReturnDto {
  geral!: GeralDto;
  solicitacoes!: SolicitacoesDto;
  financeiro!: FinanceiroDto;
  servicos!: ServicosDto;
}
