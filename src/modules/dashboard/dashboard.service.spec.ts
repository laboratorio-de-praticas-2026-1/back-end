export interface DashboardReturnDto {
  solicitacoes: {
    solicitacoesEmAberto: number;
    solicitacoesConcluidas: number;
    documentosPendentesValidacao: number;
  };
}
