/* eslint-disable prettier/prettier */
import { Type, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoriaFaqEnum } from '../../../models/faq.model';

export class CreateFaqDto {
  @ApiProperty({
    example: 'Como faço para registrar meu veículo?',
    description: 'Pergunta da FAQ',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'A pergunta deve ser um texto.' })
  @IsNotEmpty({ message: 'A pergunta é obrigatória.' })
  pergunta!: string;

  @ApiProperty({
    example: 'Para registrar seu veículo, acesse a seção de documentos e preencha o formulário...',
    description: 'Resposta da FAQ',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'A resposta deve ser um texto.' })
  @IsNotEmpty({ message: 'A resposta é obrigatória.' })
  resposta!: string;

  @ApiProperty({
    enum: CategoriaFaqEnum,
    example: 'documentacao',
    description: 'Categoria da FAQ. Valores permitidos: documentacao, regularizacao, manutencao, outros, frequentes',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  @IsEnum(CategoriaFaqEnum, {
    message:
      'Categoria inválida. Valores permitidos: documentacao, regularizacao, manutencao, outros, frequentes',
  })
  categoria!: CategoriaFaqEnum;

  @ApiPropertyOptional({
    example: true,
    description: 'Status da FAQ (ativa ou inativa)',
  })
  @IsOptional()
  @IsBoolean({ message: 'O status deve ser verdadeiro ou falso.' })
  status?: boolean;
}
