/* eslint-disable prettier/prettier */
import { Type, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { CategoriaFaqEnum } from '../../../models/faq.model';

export class UpdateFaqDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'A pergunta deve ser um texto.' })
  pergunta?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'A resposta deve ser um texto.' })
  resposta?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.toLowerCase().trim()
      : value,
  )
  @IsEnum(CategoriaFaqEnum, {
    message:
      'Categoria inválida. Valores permitidos: documentacao, regularizacao, manutencao, outros, frequentes',
  })
  categoria?: CategoriaFaqEnum;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'O status deve ser verdadeiro ou falso.' })
  status?: boolean;
}