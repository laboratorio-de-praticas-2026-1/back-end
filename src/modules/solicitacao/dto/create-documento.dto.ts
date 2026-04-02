import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentoDto {
  @IsString()
  @IsNotEmpty()
  tipo_documento: string;
}
