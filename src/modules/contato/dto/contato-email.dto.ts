import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ContatoEmailRequestDto {
  @ApiProperty({ example: 'Maria Souza' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'maria@email.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiProperty({ example: 'Gostaria de mais informacoes sobre o servico.' })
  @IsString()
  @IsNotEmpty()
  mensagem: string;
}

export class ContatoEmailResponseDto {
  @ApiProperty({ example: 'E-mail enviado com sucesso' })
  message: string;
}
