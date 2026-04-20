import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  ClientesDashboardDto,
  DashboardReturnDto,
  DocumentosDashboardDto,
  FinanceiroDto,
  GeralDto,
  ServicosDto,
  SolicitacoesDto,
  VeiculosDto,
} from './dto/dashboard-return.dto';
import { DashboardPeriodoQueryDto } from './dto/dashboard-periodo-query.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('all')
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarTudoDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<DashboardReturnDto> {
    return this.dashboardService.retornoTotalDashboard(query.inicio, query.fim);
  }

  @Get()
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarGeralDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<GeralDto> {
    return this.dashboardService.obterDadosGerais(query.inicio, query.fim);
  }

  @Get('solicitacoes')
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarSolicitacoesDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<SolicitacoesDto> {
    return this.dashboardService.obterDadosSolicitacoes(
      query.inicio,
      query.fim,
    );
  }

  @Get('veiculos')
  async retornarVeiculosDashboard(): Promise<VeiculosDto> {
    return this.dashboardService.obterDadosVeiculos();
  }

  @Get('servicos')
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarServicosDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<ServicosDto> {
    return this.dashboardService.obterDadosServicos(query.inicio, query.fim);
  }

  @Get('financeiro')
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarFinanceiroDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<FinanceiroDto> {
    return this.dashboardService.obterDadosFinanceiro(query.inicio, query.fim);
  }

  @Get('documentos')
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarDocumentosDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<DocumentosDashboardDto> {
    return this.dashboardService.obterDadosDocumentos(query.inicio, query.fim);
  }

  @Get('clientes')
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarClientesDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<ClientesDashboardDto> {
    return this.dashboardService.obterDadosClientes(query.inicio, query.fim);
  }
}
