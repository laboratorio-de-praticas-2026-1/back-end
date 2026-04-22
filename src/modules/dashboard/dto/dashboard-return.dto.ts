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

export class VeiculosDto {
  totalCadastrados!: number;
  comSolicitacaoAtiva!: number;
  comDebitoPendente!: number;
  debitosPendentes!: {
    valorTotal: number;
    porVeiculo: {
      veiculoId: number;
      placa: string;
      totalDebitos: number;
      valorTotal: number;
    }[];
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

export class DebitoEmAbertoDto {
  id!: number;
  nomeCliente!: string;
  nomeServico!: string;
  valor!: number;
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
    listaDetalhada: DebitoEmAbertoDto[];
  };
  parcelasVencidasNaoPagas!: {
    quantidade: number;
    valorTotal: number;
  };
}

export class ClienteTopPorVolumeDto {
  usuarioId!: number;
  nome!: string;
  totalSolicitacoes!: number;
}

export class ClienteTopPorValorPagoDto {
  usuarioId!: number;
  nome!: string;
  valorTotalPago!: number;
}

export class ClienteComParcelasEmAtrasoDto {
  usuarioId!: number;
  nome!: string;
  quantidadeParcelasAtrasadas!: number;
  valorTotalAtrasado!: number;
}

export class ClientesDto {
  topPorVolume!: ClienteTopPorVolumeDto[];
  topPorValorPago!: ClienteTopPorValorPagoDto[];
  comParcelasEmAtraso!: ClienteComParcelasEmAtrasoDto[];
}

export class RejeicaoPorTipoDocumentoDto {
  tipoDocumento!: string;
  totalRejeitados!: number;
}

export class DocumentosDto {
  pendentes!: number;
  aprovados!: number;
  rejeitados!: number;
  solicitacoesTravadas!: number;
  rejeicoesPorTipo!: RejeicaoPorTipoDocumentoDto[];
}

export class DashboardReturnDto {
  geral!: GeralDto;
  solicitacoes!: SolicitacoesDto;
  financeiro!: FinanceiroDto;
  servicos!: ServicosDto;
  veiculos!: VeiculosDto;
  clientes!: ClientesDto;
  documentos!: DocumentosDto;
}
