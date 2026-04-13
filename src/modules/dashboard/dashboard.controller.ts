import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardReturnDto } from './dto/dashboard-return.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiQuery({ name: 'inicio', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'fim', required: false, example: '2025-06-30' })
  async retornarInfosDashboard(
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string,
  ): Promise<DashboardReturnDto> {
    return this.dashboardService.retornarInfosDashboard(inicio, fim);
  }
}