import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class BuscaEmpresaFiltroDto {
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsIn(['clinica', 'detran', 'vistoria'], {
    message: 'Campo "tipo" deve ser "clinica", "detran" ou "vistoria"',
  })
  @ApiPropertyOptional({
    description: 'Tipo da empresa',
    example: 'detran',
    type: String,
  })
  declare tipo?: string;

  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'UF da empresa',
    example: 'PR',
    type: String,
  })
  declare estado?: string;

  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Cidade da empresa',
    example: 'Curitiba',
    type: String,
  })
  declare cidade?: string;
}
