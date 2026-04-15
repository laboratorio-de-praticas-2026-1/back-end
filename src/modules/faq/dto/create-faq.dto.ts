/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFaqDto {
  @IsString({ message: 'A pergunta deve ser um texto.' })
  @IsNotEmpty({ message: 'A pergunta é obrigatória.' })
  pergunta!: string;

  @IsString({ message: 'A resposta deve ser um texto.' })
  @IsNotEmpty({ message: 'A resposta é obrigatória.' })
  resposta!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'O campo categoriaId deve ser um número.' })
  @IsNotEmpty({ message: 'A categoria é obrigatória.' })
  categoriaId!: number;

  @IsOptional()
  @IsBoolean({ message: 'O status deve ser verdadeiro ou falso.' })
  status?: boolean;
}