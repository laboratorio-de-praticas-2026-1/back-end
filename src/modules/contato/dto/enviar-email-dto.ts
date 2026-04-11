import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EnviarEmailDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Victor Silva',
  })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'E-mail de contato do usuário',
    example: 'victor@email.com',
  })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ description: 'Assunto do e-mail', example: 'Orçamento' })
  @IsNotEmpty({ message: 'O assunto é obrigatório' })
  @IsString()
  assunto: string;

  @ApiProperty({
    description: 'Mensagem do usuário',
    example: 'Olá, gostaria de saber mais sobre os serviços...',
  })
  @IsNotEmpty({ message: 'A mensagem é obrigatória' })
  @IsString()
  mensagem: string;

  @ApiProperty({
    description: 'Telefone/Celular do usuário',
    required: false,
    example: '(13) 99999-8888',
  })
  @IsOptional()
  @IsString()
  telefone?: string;
}