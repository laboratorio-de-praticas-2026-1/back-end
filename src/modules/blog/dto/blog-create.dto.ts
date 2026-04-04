import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { CategoriaBlog } from 'src/models/blog.model';

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

  @ApiProperty({
    example: 'Resumo do post',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  olhoDoTexto?: string;

  @ApiProperty({
    enum: CategoriaBlog,
    example: CategoriaBlog.Documentacao,
    required: false,
    default: CategoriaBlog.Documentacao,
  })
  @IsOptional()
  @IsEnum(CategoriaBlog)
  categoria?: CategoriaBlog;

  @Transform(({ value }) => value === 'true' || value === true)
  @ApiProperty({
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
