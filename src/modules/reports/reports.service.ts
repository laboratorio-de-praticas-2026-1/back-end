import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  getCategorias() {
    return {
      categorias: [
        {
          nome: 'Relatório Completo',
          endpoint: '/reports/categorias/completo',
        },
        {
          nome: 'Performance Financeira',
          endpoint: '/reports/categorias/financeiro',
        },
        {
          nome: 'Desempenho Operacional',
          endpoint: '/reports/categorias/operacional',
          subcategorias: [
            {
              nome: 'Performance de Serviços',
              endpoint: '/reports/categorias/operacional/servicos',
            },
            {
              nome: 'Gestão de Solicitações',
              endpoint: '/reports/categorias/operacional/solicitacoes',
            },
            {
              nome: 'Gestão de Documentos',
              endpoint: '/reports/categorias/operacional/documentos',
            },
            {
              nome: 'Gestão de Veículos',
              endpoint: '/reports/categorias/operacional/veiculos',
            },
            {
              nome: 'Base de Clientes',
              endpoint: '/reports/categorias/operacional/clientes',
            },
            {
              nome: 'Análise de Eficiência',
              endpoint: '/reports/categorias/operacional/eficiencia',
            },
            {
              nome: 'Funil de Conversão',
              endpoint: '/reports/categorias/operacional/funil',
            },
            {
              nome: 'Gargalos Operacionais',
              endpoint: '/reports/categorias/operacional/gargalos',
            },
          ],
        },
      ],
    };
  }

  getRelatorioCompleto() {
    return { categoria: 'Relatório Completo' };
  }

  getPerformanceFinanceira() {
    return { categoria: 'Performance Financeira' };
  }

  getDesempenhoOperacional() {
    return { categoria: 'Desempenho Operacional' };
  }

  getPerformanceServicos() {
    return { categoria: 'Performance de Serviços' };
  }

  getGestaoSolicitacoes() {
    return { categoria: 'Gestão de Solicitações' };
  }

  getGestaoDocumentos() {
    return { categoria: 'Gestão de Documentos' };
  }

  getGestaoVeiculos() {
    return { categoria: 'Gestão de Veículos' };
  }

  getBaseClientes() {
    return { categoria: 'Base de Clientes' };
  }

  getAnaliseEficiencia() {
    return { categoria: 'Análise de Eficiência' };
  }

  getFunilConversao() {
    return { categoria: 'Funil de Conversão' };
  }

  getGargalosOperacionais() {
    return { categoria: 'Gargalos Operacionais' };
  }
}
