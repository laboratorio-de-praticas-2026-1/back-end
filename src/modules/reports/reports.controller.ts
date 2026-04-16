import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports/categorias')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Página principal
  @Get()
  getCategorias() {
    return this.reportsService.getCategorias();
  }

  @Get('completo')
  getRelatorioCompleto() {
    return this.reportsService.getRelatorioCompleto();
  }

  @Get('financeiro')
  getPerformanceFinanceira() {
    return this.reportsService.getPerformanceFinanceira();
  }

  @Get('operacional')
  getDesempenhoOperacional() {
    return this.reportsService.getDesempenhoOperacional();
  }

  @Get('operacional/servicos')
  getPerformanceServicos() {
    return this.reportsService.getPerformanceServicos();
  }

  @Get('operacional/solicitacoes')
  getGestaoSolicitacoes() {
    return this.reportsService.getGestaoSolicitacoes();
  }

  @Get('operacional/documentos')
  getGestaoDocumentos() {
    return this.reportsService.getGestaoDocumentos();
  }

  @Get('operacional/veiculos')
  getGestaoVeiculos() {
    return this.reportsService.getGestaoVeiculos();
  }

  @Get('operacional/clientes')
  getBaseClientes() {
    return this.reportsService.getBaseClientes();
  }

  @Get('operacional/eficiencia')
  getAnaliseEficiencia() {
    return this.reportsService.getAnaliseEficiencia();
  }

  @Get('operacional/funil')
  getFunilConversao() {
    return this.reportsService.getFunilConversao();
  }

  @Get('operacional/gargalos')
  getGargalosOperacionais() {
    return this.reportsService.getGargalosOperacionais();
  }
}
