export interface DashboardReturnDto {
  solicitacoes: {
    solicitacoesEmAberto: number;
    solicitacoesConcluidas: number;
    documentosPendentesValidacao: number;
  };
  veiculos: {
    totalCadastrados: number;
    comSolicitacaoAtiva: number;
    comDebitoPendente: number;
    debitosPendentes: {
      valorTotal: number;
      porVeiculo: {
        veiculoId: number;
        placa: string;
        totalDebitos: number;
        valorTotal: number;
      }[];
    };
  };
}
