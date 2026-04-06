import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PublicidadeCreateDto {
  @IsString()
  @ApiProperty({
    example: 'Seguro Auto Completo',
  })
  titulo: string;

  @IsString()
  @ApiProperty({
    example: 'Proteja seu veiculo com nosso parceiro credenciado.',
  })
  conteudo: string;

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

export class PublicidadeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  titulo: string;

  @ApiProperty()
  conteudo: string;

  @ApiProperty()
  urlImagem: string;

  @ApiProperty()
  ativo: boolean;
}
