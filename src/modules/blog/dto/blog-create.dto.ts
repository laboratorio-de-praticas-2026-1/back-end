import { IsDateString, IsString } from 'class-validator';

export class BlogCreateDto {
  @IsString()
  titulo: string;

  @IsString()
  conteudo: string;

  @IsDateString()
  dataPublicacao: Date;
}
