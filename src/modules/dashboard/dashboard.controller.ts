import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardReturnDto } from './dto/dashboard-return.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async retornarInfosDashboard(): Promise<DashboardReturnDto> {
    return this.dashboardService.retornarInfosDashboard();
  }
}
