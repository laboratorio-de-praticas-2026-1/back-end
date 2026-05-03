import { IsOptional, IsString, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class BuscaSolicitacaoDto {
  @IsOptional()
  @IsString()
  declare termo?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Campo "de" deve ser uma data válida no formato YYYY-MM-DD' })
  declare de?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Campo "ate" deve ser uma data válida no formato YYYY-MM-DD' })
  declare ate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Campo "servico_id" deve ser um inteiro' })
  declare servico_id?: number;

  @IsOptional()
  @IsString()
  // valores possíveis: 'pendente' | 'aprovado' | 'rejeitado'
  declare status_documentacao?: 'pendente' | 'aprovado' | 'rejeitado';
}
