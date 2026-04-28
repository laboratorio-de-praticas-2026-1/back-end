import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateReciboDto {
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  @IsInt({ message: 'O campo idSolicitacao deve ser um número inteiro' })
  @Min(1, { message: 'O campo idSolicitacao deve ser maior que zero' })
  @IsNotEmpty({ message: 'O campo idSolicitacao é obrigatório' })
  idSolicitacao!: number;
}
