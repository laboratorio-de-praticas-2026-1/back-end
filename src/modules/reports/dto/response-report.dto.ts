import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RelatorioCategoria } from 'src/models/relatorio.model';

export class ResponseReportDto {
  @ApiProperty({
    description: 'ID do relatório',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Nome do relatório. Máximo de 100 caracteres.',
    example: 'Relatório de Performance Financeira - Q1 2025',
    maxLength: 100,
  })
  nome!: string;

  @ApiPropertyOptional({
    description: 'Descrição do relatório. Máximo de 255 caracteres.',
    example:
      'Relatório detalhado sobre a performance financeira do último trimestre.',
    maxLength: 255,
    nullable: true,
  })
  descricao?: string | null;

  @ApiProperty({
    description: 'Categoria do relatório.',
    enum: RelatorioCategoria,
    example: RelatorioCategoria.PERFORMANCE_FINANCEIRA,
  })
  categoria!: RelatorioCategoria;

  @ApiProperty({
    description: 'Hash ou URL do documento gerado',
    example: 'abc123xyz456',
  })
  urlDocumentoHash!: string;

  @ApiProperty({
    description: 'Data de geração do relatório',
    example: '2026-04-16',
    type: String,
    format: 'date',
  })
  dataGeracao!: Date;
}
