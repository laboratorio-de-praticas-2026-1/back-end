export class SolicitacaoComServicoDto {
  servico!: {
    nome: string;
    descricao: string;
    valor_base: number;
    ativo: boolean;
  };
}
