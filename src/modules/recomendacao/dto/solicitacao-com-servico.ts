export interface SolicitacaoComServico {
  servico: {
    nome: string;
    descricao: string;
    valor_base: number;
    ativo: boolean;
  };
}
