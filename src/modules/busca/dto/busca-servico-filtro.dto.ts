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
        'Campo "valor_base_de" deve ser uma quantia real, tipo double, exemplo: 50.00',
    },
  )
  @Min(0, { message: 'Campo "valor_base_de" deve ser maior ou igual a 0' })
  @ApiPropertyOptional({
    description: 'Valor base inicial do intervalo do serviço (decimal, 2 casas)',
    example: 50,
    type: Number,
  })
  declare valor_base_de?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Campo "valor_base_ate" deve ser uma quantia real, tipo double, exemplo: 150.00',
    },
  )
  @Min(0, { message: 'Campo "valor_base_ate" deve ser maior ou igual a 0' })
  @ApiPropertyOptional({
    description: 'Valor base final do intervalo do serviço (decimal, 2 casas)',
    example: 150,
    type: Number,
  })
  declare valor_base_ate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Campo "prazo_estimado_de" deve ser um inteiro' })
  @Min(0, { message: 'Campo "prazo_estimado_de" deve ser maior ou igual a 0' })
  @ApiPropertyOptional({
    description: 'Prazo estimado inicial do intervalo, em dias',
    example: 10,
    type: Number,
  })
  declare prazo_estimado_de?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Campo "prazo_estimado_ate" deve ser um inteiro' })
  @Min(0, { message: 'Campo "prazo_estimado_ate" deve ser maior ou igual a 0' })
  @ApiPropertyOptional({
    description: 'Prazo estimado final do intervalo, em dias',
    example: 30,
    type: Number,
  })
  declare prazo_estimado_ate?: number;

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
