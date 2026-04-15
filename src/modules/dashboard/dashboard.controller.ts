import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardReturnDto } from './dto/dashboard-return.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async retornarInfosDashboard(
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string,
  ): Promise<DashboardReturnDto> {
    return this.dashboardService.retornarInfosDashboard(inicio, fim);
  }
}
