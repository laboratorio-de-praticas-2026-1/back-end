import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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

  @ApiProperty({
    example: 'true',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  ativo?: boolean;
}
