/* eslint-disable prettier/prettier */
import { Type, Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CategoriaFaqEnum } from '../../../models/faq.model';

export class UpdateFaqDto {
  @ApiPropertyOptional({
    example: 'Como faço para registrar meu veículo?',
    description: 'Pergunta da FAQ',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'A pergunta deve ser um texto.' })
  pergunta?: string;

  @ApiPropertyOptional({
    example: 'Para registrar seu veículo, acesse a seção de documentos e preencha o formulário...',
    description: 'Resposta da FAQ',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'A resposta deve ser um texto.' })
  resposta?: string;

  @ApiPropertyOptional({
    enum: CategoriaFaqEnum,
    example: 'documentacao',
    description: 'Categoria da FAQ. Valores permitidos: documentacao, regularizacao, manutencao, outros, frequentes',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  @IsEnum(CategoriaFaqEnum, {
    message:
      'Categoria inválida. Valores permitidos: documentacao, regularizacao, manutencao, outros, frequentes',
  })
  categoria?: CategoriaFaqEnum;

  @ApiPropertyOptional({
    example: true,
    description: 'Status da FAQ (ativa ou inativa)',
  })
  @IsOptional()
  @IsBoolean({ message: 'O status deve ser verdadeiro ou falso.' })
  status?: boolean;
}
