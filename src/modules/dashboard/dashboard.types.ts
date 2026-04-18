import { Servico } from '../../models/servico.model';
import { Solicitacao } from '../../models/solicitacao.model';
import { DebitoServico } from '../../models/debito-servico.model';

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

export type MaisSolicitadosRow = Solicitacao & {
  servico?: Servico;
  get(key: 'servicoId' | 'totalSolicitacoes'): string | number | null;
};

export type ReceitaPorServicoRow = DebitoServico & {
  servico?: Servico;
  get(
    key: 'servicoId' | 'totalSolicitacoes' | 'receitaTotal',
  ): string | number | null;
};

export type StatusCountRow = {
  status: string;
  quantidade: number | string;
};

export type TempoConclusaoRow = {
  servicoId: number | string;
  servicoNome: string;
  prazoEstimadoDias: number | string;
  mediaRealDias: number | string;
  totalConcluidas: number | string;
};
