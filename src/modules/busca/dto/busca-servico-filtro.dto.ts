import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class BuscaServicoFiltroDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Campo "valor_base" deve ser uma quantia real, tipo double, exemplo: 98.00',
    },
  )
  @Min(0, { message: 'Campo "valor_base" deve ser maior ou igual a 0' })
  @ApiPropertyOptional({
    description: 'Valor base do serviço (decimal, 2 casas)',
    example: 145.0,
    type: Number,
  })
  declare valor_base?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Campo "prazo_estimado" deve ser um inteiro' })
  @Min(0, { message: 'Campo "prazo_estimado" deve ser maior ou igual a 0' })
  @ApiPropertyOptional({
    description: 'Prazo estimado para execução do serviço, em dias',
    example: 15,
    type: Number,
  })
  declare prazo_estimado?: number;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim().toLowerCase() : (value as unknown),
  )
  @IsIn(['ativo', 'inativo'], {
    message: 'Campo "status" deve ser "ativo" ou "inativo"',
  })
  @ApiPropertyOptional({
    description: 'Status do serviço',
    example: 'ativo',
    enum: ['ativo', 'inativo'],
  })
  declare status?: 'ativo' | 'inativo';
}
