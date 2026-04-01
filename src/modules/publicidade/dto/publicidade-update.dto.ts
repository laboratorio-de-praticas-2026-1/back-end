import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublicidadeUpdateDto {
  @ApiProperty({
    example: 'Nova campanha',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiProperty({
    example: 'Conteúdo da publicidade',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  conteudo?: string;
}