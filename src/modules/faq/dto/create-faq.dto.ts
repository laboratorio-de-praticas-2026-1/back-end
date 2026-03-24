/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFaqDto {
  @IsString({ message: 'A pergunta deve ser um texto.' })
  @IsNotEmpty({ message: 'A pergunta é obrigatória.' })
  pergunta: string;

  @IsString({ message: 'A resposta deve ser um texto.' })
  @IsNotEmpty({ message: 'A resposta é obrigatória.' })
  resposta: string;
}