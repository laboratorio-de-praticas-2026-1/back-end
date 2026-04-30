import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EmailDados {
  @IsString()
  nome: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsString()
  mensagem: string;
}

export class EmailParams {
  @IsString()
  to: string;

  @IsString()
  template: string;

  @IsOptional()
  withHeader?: boolean;

  @ValidateNested()
  @Type(() => EmailDados)
  dados: EmailDados;
}
