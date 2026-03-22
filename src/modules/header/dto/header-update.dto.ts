import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class HeaderUpdateDto {
  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  ativo?: boolean;
}
