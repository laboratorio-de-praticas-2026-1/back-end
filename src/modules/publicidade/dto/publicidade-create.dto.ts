import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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
