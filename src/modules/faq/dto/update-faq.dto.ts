/* eslint-disable prettier/prettier */
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateFaqDto {
  @IsOptional()
  @IsString({ message: 'A pergunta deve ser um texto.' })
  pergunta?: string;

  @IsOptional()
  @IsString({ message: 'A resposta deve ser um texto.' })
  resposta?: string;

  @IsOptional()
  @IsString({ message: 'A categoria deve ser um texto.' })
  categoria?: string;

  @IsOptional()
  @IsBoolean({ message: 'O status deve ser verdadeiro ou falso.' })
  status?: boolean;
}