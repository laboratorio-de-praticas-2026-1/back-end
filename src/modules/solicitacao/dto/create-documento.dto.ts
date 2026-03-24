import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentoDto {
  @IsString()
  @IsNotEmpty()
  tipo_documento: string;

  @IsString()
  @IsNotEmpty()
  url_criptografada: string;
}