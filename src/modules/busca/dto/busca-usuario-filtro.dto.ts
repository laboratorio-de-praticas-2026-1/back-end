import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class BuscaUsuarioFiltroDto {
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsString()
  @IsIn(['cliente', 'administrador'], {
    message: 'Campo "nivel_usuario" deve ser "cliente" ou "administrador"',
  })
  @ApiPropertyOptional({
    description: 'Nível do usuário',
    example: 'cliente',
    type: String,
  })
  declare nivel_usuario?: 'cliente' | 'administrador';

  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @IsDateString({}, { message: 'Campo "data_cadastro" deve ser uma data válida no formato YYYY-MM-DD' })
  @ApiPropertyOptional({
    description: 'Data de cadastro no formato YYYY-MM-DD',
    example: '2026-04-15',
    type: String,
  })
  declare data_cadastro?: string;
}
