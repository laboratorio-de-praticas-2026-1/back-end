import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class HeaderCreateDto {
  @IsString()
  urlImagem: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsBoolean()
  ativo: boolean;
}
