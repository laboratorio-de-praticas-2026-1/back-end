export interface ResultadoReceita {
  total: string | null;
}

export interface ResultadoTicketMedio {
  media: string | null;
}

export interface ResultadoHistoricoMensal {
  mes: string;
  receitaRealizada: string | null;
}

export interface ResultadoInadimplencia {
  valorTotal: string | null;
  quantidadePagamentos: string | null;
  quantidadeParcelas: string | null;
}

export interface ResultadoPrevisaoCaixa {
  valorTotal: string | null;
  quantidadeParcelas: string | null;
}

export interface ResultadoDistribuicaoMetodo {
  metodo: string;
  quantidade: string | null;
  valorTotal: string | null;
}

export interface ResultadoDistribuicaoTipo {
  tipo: 'avista' | 'parcelado';
  quantidade: string | null;
  valorTotal: string | null;
}
