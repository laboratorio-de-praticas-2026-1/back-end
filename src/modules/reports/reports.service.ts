import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {

  getCategorias() {
    return {
      categorias: [
        {
          nome: "Relatório Completo",
          endpoint: "/reports/categorias/completo"
        },
        {
          nome: "Performance Financeira",
          endpoint: "/reports/categorias/financeiro"
        },
        {
          nome: "Desempenho Operacional",
          endpoint: "/reports/categorias/operacional"
        }
      ]
    };
  }

  getRelatorioCompleto() {
    return { categoria: "Relatório Completo" };
  }

  getPerformanceFinanceira() {
    return { categoria: "Performance Financeira" };
  }

  getDesempenhoOperacional() {
    return { categoria: "Desempenho Operacional" };
  }

  getPerformanceServicos() {
    return { categoria: "Performance de Serviços" };
  }

  getGestaoSolicitacoes() {
    return { categoria: "Gestão de Solicitações" };
  }

  getGestaoDocumentos() {
    return { categoria: "Gestão de Documentos" };
  }

  getGestaoVeiculos() {
    return { categoria: "Gestão de Veículos" };
  }

  getBaseClientes() {
    return { categoria: "Base de Clientes" };
  }

  getAnaliseEficiencia() {
    return { categoria: "Análise de Eficiência" };
  }

  getFunilConversao() {
    return { categoria: "Funil de Conversão" };
  }

  getGargalosOperacionais() {
    return { categoria: "Gargalos Operacionais" };
  }
}
