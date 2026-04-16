import { IsOptional, IsDateString } from 'class-validator';

export class DashboardPeriodoQueryDto {
  @IsOptional()
  @IsDateString({}, { message: 'A data deve estar no formato YYYY-MM-DD' })
  inicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'A data deve estar no formato YYYY-MM-DD' })
  fim?: string;
}
