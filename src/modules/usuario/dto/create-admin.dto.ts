import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NivelUsuario } from './create-usuario.dto';

export class CreateAdminUsuarioDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: 'joao@empresa.com' })
  @IsEmail()
  @MaxLength(100)
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'senhaTemporaria123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @MaxLength(255)
  @IsNotEmpty()
  senha!: string;

  @ApiProperty({ enum: NivelUsuario, example: NivelUsuario.cliente })
  @IsNotEmpty()
  @IsEnum(NivelUsuario, { message: 'Nível inválido' })
  nivel!: NivelUsuario;

  @ApiPropertyOptional({ example: '00000000000' })
  @IsOptional()
  @Expose({ name: 'cpf_cnpj' })
  @Transform(
    ({
      obj,
      value,
    }: {
      obj: { cpfCnpj?: string; cpf_cnpj?: string };
      value?: string;
    }) => obj.cpf_cnpj ?? obj.cpfCnpj ?? value,
    { toClassOnly: true },
  )
  @IsString()
  @Matches(/^(\d{11}|\d{14})$/, { message: 'CPF/CNPJ inválido' })
  cpfCnpj?: string;

  @ApiPropertyOptional({ example: '13999999999' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'Celular inválido' })
  celular?: string;
}
