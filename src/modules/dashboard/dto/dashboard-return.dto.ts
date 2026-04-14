export class HistoricoMensalDto {
  mes: string;
  receitaRealizada: number;
}

/*débitos vencidos e não pagos*/
export class InadimplenciaDto {
  valorTotal: number;
  quantidadePagamentos: number;
  quantidadeParcelas: number;
}

/*Previsão de caixa para os próximos 30 dias*/
export class PrevisaoCaixa30DiasDto {
  valorTotal: number;
  quantidadeParcelas: number;
}

/*Receita agrupada por canal de pagamento (pix, boleto, etc.) */
export class PorMetodoPagamentoDto {
  metodo: string;
  quantidade: number;
  valorTotal: number;
}

/*Receita agrupada por tipo de pagamento (à vista vs. parcelado)*/
export class PorTipoPagamentoDto {
  tipo: 'avista' | 'parcelado';
  quantidade: number;
  valorTotal: number;
}

export class FinanceiroDto {
  receitaRealizada: number;

  receitaPendente: number;

  receitaTaxa: number;

  ticketMedio: number;

  mediaMensalReceita: number;

  historicoMensal: HistoricoMensalDto[];

  inadimplencia: InadimplenciaDto;

  previsaoCaixa30Dias: PrevisaoCaixa30DiasDto;

  porMetodoPagamento: PorMetodoPagamentoDto[];

  porTipoPagamento: PorTipoPagamentoDto[];
}

export class SolicitacoesDto {
  solicitacoesEmAberto: number;
  solicitacoesConcluidas: number;
  documentosPendentesValidacao: number;
}

export class DashboardReturnDto {
  solicitacoes: SolicitacoesDto;
  financeiro: FinanceiroDto;
}
