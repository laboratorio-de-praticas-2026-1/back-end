import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RelatorioCategoria } from 'src/models/relatorio.model';

function parseDateInput(value: unknown): unknown {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(value);
}

export class CreateReportDto {
  @ApiProperty({
    description: 'Nome do relatório. Máximo de 100 caracteres.',
    example: 'Relatório de Performance Financeira - Q1 2025',
    maxLength: 100,
  })
  @MaxLength(100)
  @IsNotEmpty({ message: 'O nome do relatório é obrigatório' })
  @IsString({ message: 'O nome do relatório deve ser um texto' })
  nome!: string;

  @ApiPropertyOptional({
    description: 'Descrição do relatório. Máximo de 255 caracteres.',
    example:
      'Relatório detalhado sobre a performance financeira do último trimestre.',
    maxLength: 255,
  })
  @MaxLength(255, {
    message: 'A descrição do relatório deve ter no máximo 255 caracteres',
  })
  @IsOptional()
  @IsString({ message: 'A descrição do relatório deve ser um texto' })
  descricao?: string;

  @ApiProperty({
    description:
      'Categoria do relatório. Valores possíveis: relatorio_completo, performance_financeira, desempenho_operacional, performance_servicos, gestao_solicitacoes, gestao_documentos, gestao_veiculos, base_clientes, analise_eficiencia, funil_conversao, gargalos_operacionais.',
    enum: RelatorioCategoria,
  })
  @IsEnum(RelatorioCategoria, { message: 'Categoria de Relatório Inválida' })
  categoria!: RelatorioCategoria;

  @ApiPropertyOptional({
    description:
      'Data de início do período para o relatório. Formato yyyy-MM-dd. Se não for fornecida, será considerada a data atual menos 30 dias.',
    example: '2025-01-01',
  })
  @IsOptional()
  @Transform(({ value }) => parseDateInput(value), { toClassOnly: true })
  @IsDate({ message: 'Data de início deve ser uma data válida' })
  dataPeriodoInicio?: Date;

  @ApiPropertyOptional({
    description:
      'Data de fim do período para o relatório. Formato yyyy-MM-dd. Se não for fornecida, será considerada a data atual.',
    example: '2026-02-01',
  })
  @IsOptional()
  @Transform(({ value }) => parseDateInput(value), { toClassOnly: true })
  @IsDate({ message: 'Data de fim deve ser uma data válida' })
  dataPeriodoFim?: Date;
}
