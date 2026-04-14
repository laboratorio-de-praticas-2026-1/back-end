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

export enum NivelUsuario {
  cliente = 'cliente',
  administrador = 'administrador',
}

export class CreateUsuarioDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  nome!: string;

  @IsEmail()
  @MaxLength(100)
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @MaxLength(255)
  @IsNotEmpty()
  senha!: string;

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
  @Matches(/^(\d{11}|\d{14})$/, {
    message: 'CPF/CNPJ inválido',
  })
  cpfCnpj?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'Celular inválido',
  })
  celular?: string;
}
