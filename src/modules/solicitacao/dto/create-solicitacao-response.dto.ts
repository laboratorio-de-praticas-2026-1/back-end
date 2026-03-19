export type ProtocoloSolicitacaoDto = {
  cliente: {
    nome: string;
  };
  servico: {
    nome: string;
    valor_base: number | null;
  };
  solicitacao: {
    data_solicitacao: string;
    prazo_estimado: string;
  };
};

export type CreateSolicitacaoResponseDto = {
  message: string;
  protocolo: ProtocoloSolicitacaoDto;
};
