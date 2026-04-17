import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  getCategorias() {
    return [
      { nome: 'Relatório Completo', valor: 'completo' },
      { nome: 'Performance Financeira', valor: 'financeiro' },
      { nome: 'Desempenho Operacional', valor: 'operacional' },
      { nome: 'Performance de Serviços', valor: 'servicos' },
      { nome: 'Gestão de Solicitações', valor: 'solicitacoes' },
      { nome: 'Gestão de Documentos', valor: 'documentos' },
      { nome: 'Gestão de Veículos', valor: 'veiculos' },
      { nome: 'Base de Clientes', valor: 'clientes' },
      { nome: 'Análise de Eficiência', valor: 'eficiencia' },
      { nome: 'Funil de Conversão', valor: 'funil' },
      { nome: 'Gargalos Operacionais', valor: 'gargalos' }
    ];
  }
}
