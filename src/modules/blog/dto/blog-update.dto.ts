import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlogUpdateDto {
  @ApiProperty({
    example: 'Título do Post Atualizado',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiProperty({
    example: 'Conteúdo do post aqui...',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  conteudo?: string;

  @ApiProperty({
    example: '2026-03-21',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  dataPublicacao?: Date;
}
