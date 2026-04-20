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

export interface StatusCountRaw {
  status: string;
  quantidade: number | string;
}

export interface ParcelasVencidasRaw {
  valorTotal: number | string | null;
  quantidadeParcelas: number | string | null;
}

export interface TempoConclusaoRaw {
  servicoId: number | string;
  servicoNome: string;
  prazoEstimadoDias: number | string;
  mediaRealDias: number | string;
  totalConcluidas: number | string;
}

export interface DebitoVeiculoRaw {
  idVeiculo: number;
  totalDebitos: number | string;
  valorTotal: number | string;
  veiculo: { placa: string };
}

export interface TopClienteVolumeRaw {
  usuarioId: number | string;
  nome: string;
  totalSolicitacoes: number | string;
}

export interface TopClienteValorPagoRaw {
  usuarioId: number | string;
  nome: string;
  valorTotalPago: number | string;
}

export interface ClienteParcelaAtrasoRaw {
  usuarioId: number | string;
  nome: string;
  quantidadeParcelasAtrasadas: number | string;
  valorTotalAtrasado: number | string;
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
