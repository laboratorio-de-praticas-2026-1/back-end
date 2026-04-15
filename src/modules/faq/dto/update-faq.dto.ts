/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFaqDto {
  @IsOptional()
  @IsString({ message: 'A pergunta deve ser um texto.' })
  pergunta?: string;

  @IsOptional()
  @IsString({ message: 'A resposta deve ser um texto.' })
  resposta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'O campo categoriaId deve ser um número.' })
  categoriaId?: number;

  @IsOptional()
  @IsBoolean({ message: 'O status deve ser verdadeiro ou falso.' })
  status?: boolean;
}