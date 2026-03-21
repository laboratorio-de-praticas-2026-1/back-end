import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BuscaBlogIntervaloDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Campo "de" deve estar no formato YYYY-MM-DD',
  })
  @ApiPropertyOptional({
    description: 'Data inicial do intervalo',
    example: '2024-10-29',
    type: String,
  })
  declare de?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Campo "ate" deve estar no formato YYYY-MM-DD',
  })
  @ApiPropertyOptional({
    description: 'Data final do intervalo',
    example: '2024-12-31',
    type: String,
  })
  declare ate?: string;
}
