export interface DashboardReturnDto {
  solicitacoes: {
    porStatus: {
      recebido: number;
      emAndamento: number;
      aguardandoPagamento: number;
      aguardandoDocumento: number;
      concluido: number;
      cancelado: number;
    };
    proximasDeVencer: {
      quantidade: number;
    };
    tempoConclusaoPorServico: {
      servicoId: number;
      servicoNome: string;
      prazoEstimadoDias: number;
      mediaRealDias: number;
      totalConcluidas: number;
    }[];
    foraDoPrazo: {
      quantidade: number;
      totalConcluidas: number;
      percentual: number;
    };
  };
}
