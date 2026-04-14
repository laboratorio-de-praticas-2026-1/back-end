export interface DashboardReturnDto {
  solicitacoes: {
    solicitacoesEmAberto: number;
    solicitacoesConcluidas: number;
    documentosPendentesValidacao: number;
  };
  servicos: {
    ativos: number;
    pausados: number;
    maisSolicitados: {
      servicoId: number;
      nome: string;
      totalSolicitacoes: number;
    }[];
    receitaPorServico: {
      servicoId: number;
      nome: string;
      totalSolicitacoes: number;
      receitaTotal: number;
    }[];
  };
}