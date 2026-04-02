import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BuscaBlogIntervaloDto {
  @IsOptional()
  @IsString()
  @IsDateString(
    {},
    { message: 'Campo "de" deve ser uma data válida no formato YYYY-MM-DD' },
  )
  @ApiPropertyOptional({
    description: 'Data inicial do intervalo',
    example: '2024-10-29',
    type: String,
  })
  declare de?: string;

  @IsOptional()
  @IsString()
  @IsDateString(
    {},
    { message: 'Campo "ate" deve ser uma data válida no formato YYYY-MM-DD' },
  )
  @ApiPropertyOptional({
    description: 'Data final do intervalo',
    example: '2024-12-31',
    type: String,
  })
  declare ate?: string;
}
