import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class HeaderUpdateDto {
  @IsOptional()
  @IsString()
  urlImagem?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
