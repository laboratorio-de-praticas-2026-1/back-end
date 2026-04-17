import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RelatorioCategoriaResponseDto } from './dto/categoria-response.dto';

export enum RelatorioCategoria {
  RELATORIO_COMPLETO = 'relatorio_completo',
  PERFORMANCE_FINANCEIRA = 'performance_financeira',
  DESEMPENHO_OPERACIONAL = 'desempenho_operacional',
  PERFORMANCE_SERVICOS = 'performance_servicos',
  GESTAO_SOLICITACOES = 'gestao_solicitacoes',
  GESTAO_DOCUMENTOS = 'gestao_documentos',
  GESTAO_VEICULOS = 'gestao_veiculos',
  BASE_CLIENTES = 'base_clientes',
  ANALISE_EFICIENCIA = 'analise_eficiencia',
  FUNIL_CONVERSAO = 'funil_conversao',
  GARGALOS_OPERACIONAIS = 'gargalos_operacionais',
}

function getCategoriaLabel(categoria: RelatorioCategoria): string {
  switch (categoria) {
    case RelatorioCategoria.RELATORIO_COMPLETO:
      return 'Relatório Completo';

    case RelatorioCategoria.PERFORMANCE_FINANCEIRA:
      return 'Performance Financeira';

    case RelatorioCategoria.DESEMPENHO_OPERACIONAL:
      return 'Desempenho Operacional';

    case RelatorioCategoria.PERFORMANCE_SERVICOS:
      return 'Performance de Serviços';

    case RelatorioCategoria.GESTAO_SOLICITACOES:
      return 'Gestão de Solicitações';

    case RelatorioCategoria.GESTAO_DOCUMENTOS:
      return 'Gestão de Documentos';

    case RelatorioCategoria.GESTAO_VEICULOS:
      return 'Gestão de Veículos';

    case RelatorioCategoria.BASE_CLIENTES:
      return 'Base de Clientes';

    case RelatorioCategoria.ANALISE_EFICIENCIA:
      return 'Análise de Eficiência';

    case RelatorioCategoria.FUNIL_CONVERSAO:
      return 'Funil de Conversão';

    case RelatorioCategoria.GARGALOS_OPERACIONAIS:
      return 'Gargalos Operacionais';

    default:
      throw new InternalServerErrorException(
        `Erro ao mapear categorias de relatório: categoria desconhecida`,
      );
  }
}

@Injectable()
export class ReportsService {
  getCategorias(): RelatorioCategoriaResponseDto[] {
    return Object.values(RelatorioCategoria).map((categoria) => {
      return new RelatorioCategoriaResponseDto(
        getCategoriaLabel(categoria),
        categoria,
      );
    });
  }
}
