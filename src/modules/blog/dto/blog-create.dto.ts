import { IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlogCreateDto {
  @ApiProperty({ example: 'Meu Primeiro Post' })
  @IsString()
  titulo: string;

  @ApiProperty({ example: 'Conteúdo do post aqui...' })
  @IsString()
  conteudo: string;

  @ApiProperty({ example: '2026-03-21' })
  @IsDateString()
  dataPublicacao: Date;
}
