import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  ClientesDto,
  DashboardReturnDto,
  DocumentosDto,
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
  @ApiOperation({
    summary: 'Retorna todos os dados do dashboard',
    description:
      'Consolida os blocos geral, solicitações, veículos, serviços, financeiro, documentos e clientes em uma única resposta.',
  })
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarTudoDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<DashboardReturnDto> {
    return this.dashboardService.retornoTotalDashboard(query.inicio, query.fim);
  }

  @Get()
  @ApiOperation({
    summary: 'Retorna os dados gerais do dashboard',
    description:
      'Obtém os indicadores gerais exibidos na visão principal do dashboard para o período informado.',
  })
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarGeralDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<GeralDto> {
    return this.dashboardService.obterDadosGerais(query.inicio, query.fim);
  }

  @Get('solicitacoes')
  @ApiOperation({
    summary: 'Retorna os dados de solicitações do dashboard',
    description:
      'Obtém métricas e totais relacionados ao fluxo de solicitações no período informado.',
  })
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
  @ApiOperation({
    summary: 'Retorna os dados de veículos do dashboard',
    description:
      'Obtém os indicadores de veículos para composição dos cartões e gráficos do dashboard.',
  })
  async retornarVeiculosDashboard(): Promise<VeiculosDto> {
    return this.dashboardService.obterDadosVeiculos();
  }

  @Get('servicos')
  @ApiOperation({
    summary: 'Retorna os dados de serviços do dashboard',
    description:
      'Obtém métricas de serviços prestados e distribuição por período para o dashboard.',
  })
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarServicosDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<ServicosDto> {
    return this.dashboardService.obterDadosServicos(query.inicio, query.fim);
  }

  @Get('financeiro')
  @ApiOperation({
    summary: 'Retorna os dados financeiros do dashboard',
    description:
      'Obtém os indicadores financeiros do período, como arrecadação, pendências e demais métricas exibidas no dashboard.',
  })
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarFinanceiroDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<FinanceiroDto> {
    return this.dashboardService.obterDadosFinanceiro(query.inicio, query.fim);
  }

  @Get('documentos')
  @ApiOperation({
    summary: 'Retorna os dados de documentos do dashboard',
    description:
      'Obtém os indicadores de documentos por status e volume no período informado.',
  })
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarDocumentosDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<DocumentosDto> {
    return this.dashboardService.obterDadosDocumentos(query.inicio, query.fim);
  }

  @Get('clientes')
  @ApiOperation({
    summary: 'Retorna os dados de clientes do dashboard',
    description:
      'Obtém os indicadores de base de clientes no período, incluindo crescimento e distribuição.',
  })
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarClientesDashboard(
    @Query() query: DashboardPeriodoQueryDto,
  ): Promise<ClientesDto> {
    return this.dashboardService.obterDadosClientes(query.inicio, query.fim);
  }
}
