import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export enum NivelUsuario {
  cliente = 'cliente',
  administrador = 'administrador',
}

export class CreateUsuarioDto {
  @IsString()
  @MaxLength(100)
  nome: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @MaxLength(255)
  senha: string;

  @IsOptional()
  @IsEnum(NivelUsuario, { message: 'Nível inválido' })
  nivel?: NivelUsuario;

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
  @MaxLength(20)
  cpfCnpj?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  celular?: string;
}
