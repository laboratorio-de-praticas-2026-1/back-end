import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

const trimString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

const trimUpperString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value.trim().toUpperCase() : undefined;

export class BuscaEmpresaFiltroDto {
  @Transform(({ value }: TransformFnParams) => trimString(value))
  @IsOptional()
  @IsString()
  @IsIn(['clinica', 'detran', 'vistoria'], {
    message: 'Campo "tipo" deve ser "clinica", "detran" ou "vistoria"',
  })
  @ApiPropertyOptional({
    description: 'Tipo da empresa',
    example: 'detran',
    type: String,
  })
  declare tipo?: string;

  @Transform(({ value }: TransformFnParams) => trimUpperString(value))
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'UF da empresa',
    example: 'PR',
    type: String,
  })
  declare estado?: string;

  @Transform(({ value }: TransformFnParams) => trimString(value))
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Cidade da empresa',
    example: 'Curitiba',
    type: String,
  })
  declare cidade?: string;
}
