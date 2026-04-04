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

  @ApiProperty({
    example: 'Resumo atualizado',
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
    nullable: true,
  })
  @IsOptional()
  @IsEnum(CategoriaBlog)
  categoria?: CategoriaBlog;

  @Transform(({ value }) => value === 'true' || value === true)
  @ApiProperty({
    example: true,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
