import { IsOptional, IsDateString } from 'class-validator';

export class DashboardPeriodoQueryDto {
  @IsOptional()
  @IsDateString()
  inicio?: string;

  @IsOptional()
  @IsDateString()
  fim?: string;
}
