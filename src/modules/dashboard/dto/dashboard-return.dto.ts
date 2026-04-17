import { ApiProperty } from "@nestjs/swagger";

export class HistoricoMensalDto {
  mes!: string;
  receitaRealizada!: number;
}

/*débitos vencidos e não pagos*/
export class InadimplenciaDto {
  valorTotal!: number;
  quantidadePagamentos!: number;
  quantidadeParcelas!: number;
}

/*Previsão de caixa para os próximos 30 dias*/
export class PrevisaoCaixa30DiasDto {
  valorTotal!: number;
  quantidadeParcelas!: number;
}

/*Receita agrupada por canal de pagamento (pix, boleto, etc.) */
export class PorMetodoPagamentoDto {
  metodo!: string;
  quantidade!: number;
  valorTotal!: number;
}

/*Receita agrupada por tipo de pagamento (à vista vs. parcelado)*/
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

class FinanceiroItemDto {
  @ApiProperty()
  quantidade: number;

  @ApiProperty()
  valorTotal: number;
}

class GeralDashboardDto {
  @ApiProperty()
  solicitacoesEmAberto: number;

  @ApiProperty()
  solicitacoesConcluidas: number;

  @ApiProperty()
  documentosPendentesValidacao: number;

  @ApiProperty()
  clientesNovosMesAtual: number;

  @ApiProperty()
  taxaCancelamentoPct: number;

  @ApiProperty({ type: FinanceiroItemDto })
  debitosEmAberto: FinanceiroItemDto;

  @ApiProperty({ type: FinanceiroItemDto })
  parcelasVencidasNaoPagas: FinanceiroItemDto;
}

export class DashboardReturnDto {
  geral!: GeralDashboardDto;
  solicitacoes!: SolicitacoesDto;
  financeiro!: FinanceiroDto;
  servicos!: ServicosDto;
}
