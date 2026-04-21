import { IsNotEmpty } from 'class-validator';

export class CreateReciboDto {
  @IsNotEmpty({ message: 'O campo idSolicitacao é obrigatório' })
  idSolicitacao!: number;
}
