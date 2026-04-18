import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

function normalizeString(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export class BuscaEmpresaFiltroDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    const normalized = normalizeString(value);
    return typeof normalized === 'string'
      ? normalized.toLowerCase()
      : normalized;
  })
  @IsIn(['clinica', 'detran', 'vistoria'], {
    message: 'Campo "tipo" deve ser "detran", "clinica" ou "vistoria"',
  })
  @ApiPropertyOptional({
    description: 'Tipo da empresa para filtrar os resultados',
    example: 'detran',
    enum: ['clinica', 'detran', 'vistoria'],
  })
  declare tipo?: 'clinica' | 'detran' | 'vistoria';

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    const normalized = normalizeString(value);
    return typeof normalized === 'string'
      ? normalized.toUpperCase()
      : normalized;
  })
  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message: 'Campo "estado" deve ser uma UF válida (ex: SP, PR, ES)',
  })
  @ApiPropertyOptional({
    description: 'UF (estado) da empresa para filtrar os resultados',
    example: 'SP',
    type: String,
  })
  declare estado?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    const normalized = normalizeString(value);
    return typeof normalized === 'string' ? normalized : normalized;
  })
  @IsString()
  @ApiPropertyOptional({
    description: 'Cidade da empresa para filtrar os resultados',
    example: 'Curitiba',
    type: String,
  })
  declare cidade?: string;
}
