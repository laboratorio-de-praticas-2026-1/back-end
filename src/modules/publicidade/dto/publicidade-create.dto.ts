import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublicidadeCreateDto {
  @IsString()
  @ApiProperty({
    example: 'Seguro Auto Completo',
  })
  titulo: string;

  @IsString()
  @ApiProperty({
    example: 'Proteja seu veículo com nosso parceiro credenciado.',
  })
  conteudo: string;

  @IsString()
  @ApiProperty({
    example: 'https://img.com/pub1.jpg',
  })
  urlImagem: string;
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
}
