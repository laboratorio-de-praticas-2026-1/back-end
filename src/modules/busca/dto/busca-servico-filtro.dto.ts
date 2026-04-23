import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class BuscaServicoFiltroDto {
  @Transform(({ value }: TransformFnParams) =>
    value === undefined || value === null || value === '' ? undefined : Number(value),
  )
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Valor base inicial', example: 50, type: Number })
  declare valor_base_de?: number;

  @Transform(({ value }: TransformFnParams) =>
    value === undefined || value === null || value === '' ? undefined : Number(value),
  )
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Valor base final', example: 500, type: Number })
  declare valor_base_ate?: number;

  @Transform(({ value }: TransformFnParams) =>
    value === undefined || value === null || value === '' ? undefined : Number(value),
  )
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Prazo estimado inicial', example: 5, type: Number })
  declare prazo_estimado_de?: number;

  @Transform(({ value }: TransformFnParams) =>
    value === undefined || value === null || value === '' ? undefined : Number(value),
  )
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Prazo estimado final', example: 15, type: Number })
  declare prazo_estimado_ate?: number;

  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsString()
  @IsIn(['ativo', 'inativo'], {
    message: 'Campo "status" deve ser "ativo" ou "inativo"',
  })
  @ApiPropertyOptional({ description: 'Status do serviço', example: 'ativo', type: String })
  declare status?: 'ativo' | 'inativo';
}
