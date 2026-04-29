/* eslint-disable prettier/prettier */
import { Type, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { CategoriaFaqEnum } from '../../../models/faq.model';

export class CreateFaqDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'A pergunta deve ser um texto.' })
  @IsNotEmpty({ message: 'A pergunta é obrigatória.' })
  pergunta!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'A resposta deve ser um texto.' })
  @IsNotEmpty({ message: 'A resposta é obrigatória.' })
  resposta!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.toLowerCase().trim()
      : value,
  )
  @IsEnum(CategoriaFaqEnum, {
    message:
      'Categoria inválida. Valores permitidos: documentacao, regularizacao, manutencao, outros, frequentes',
  })
  categoria!: CategoriaFaqEnum;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'O status deve ser verdadeiro ou falso.' })
  status?: boolean;
}