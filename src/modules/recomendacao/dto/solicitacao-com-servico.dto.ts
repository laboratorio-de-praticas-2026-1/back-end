export class SolicitacaoComServicoDto {
  servico!: {
    id: number;
    nome: string;
    descricao: string;
    valor_base: number;
    ativo: boolean;
  };
}
