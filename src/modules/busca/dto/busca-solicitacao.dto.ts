import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class BuscaSolicitacaoDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Termo de busca por nome do usuario',
    example: 'maria',
    type: String,
  })
  declare termo?: string;

  @IsOptional()
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

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Campo "servico_id" deve ser um inteiro' })
  @ApiPropertyOptional({
    description: 'ID do servico',
    example: 12,
    type: Number,
  })
  declare servico_id?: number;

  @IsOptional()
  @IsString()
  // valores possíveis: 'pendente' | 'aprovado' | 'rejeitado'
  @ApiPropertyOptional({
    description: 'Status de validacao da documentacao',
    example: 'pendente',
    enum: ['pendente', 'aprovado', 'rejeitado'],
  })
  declare status_documentacao?: 'pendente' | 'aprovado' | 'rejeitado';
}
