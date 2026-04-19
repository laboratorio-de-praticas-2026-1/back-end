import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  DashboardReturnDto,
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

  @Get('/all')
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarTudoDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<DashboardReturnDto> {
    return this.dashboardService.retornoTotalDashboard(query.inicio, query.fim);
  }

  @Get('/geral')
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarGeralDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<GeralDto> {
    return this.dashboardService.obterDadosGerais(query.inicio, query.fim);
  }

  @Get('/solicitacoes')
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

  @Get('/veiculos')
  async retornarVeiculosDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<VeiculosDto> {
    return this.dashboardService.obterDadosVeiculos();
  }
}
