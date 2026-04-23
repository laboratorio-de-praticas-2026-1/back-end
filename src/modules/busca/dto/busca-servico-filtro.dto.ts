import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toOptionalStatus = (value: unknown): 'ativo' | 'inativo' | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'ativo' || normalized === 'inativo') {
    return normalized;
  }

  return undefined;
};

export class BuscaServicoFiltroDto {
  @Transform(({ value }: TransformFnParams) => toOptionalNumber(value))
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Valor base inicial',
    example: 50,
    type: Number,
  })
  declare valor_base_de?: number;

  @Transform(({ value }: TransformFnParams) => toOptionalNumber(value))
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Valor base final',
    example: 500,
    type: Number,
  })
  declare valor_base_ate?: number;

  @Transform(({ value }: TransformFnParams) => toOptionalNumber(value))
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Prazo estimado inicial',
    example: 5,
    type: Number,
  })
  declare prazo_estimado_de?: number;

  @Transform(({ value }: TransformFnParams) => toOptionalNumber(value))
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Prazo estimado final',
    example: 15,
    type: Number,
  })
  declare prazo_estimado_ate?: number;

  @Transform(({ value }: TransformFnParams) => toOptionalStatus(value))
  @IsOptional()
  @IsString()
  @IsIn(['ativo', 'inativo'], {
    message: 'Campo "status" deve ser "ativo" ou "inativo"',
  })
  @ApiPropertyOptional({
    description: 'Status do serviço',
    example: 'ativo',
    type: String,
  })
  declare status?: 'ativo' | 'inativo';
}
