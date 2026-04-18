import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BuscaUsuarioFiltroDto {
  @IsOptional()
  @IsString()
  @IsDateString(
    {},
    {
      message:
        'Campo "data_cadastro" deve ser data válida no formato YYYY-MM-DD',
    },
  )
  @ApiPropertyOptional({
    description: 'Data de cadastro do usuário para filtrar os resultados',
    example: '2025-10-29',
    type: String,
  })
  declare data_cadastro?: string;

  @IsOptional()
  @IsString()
  @IsIn(['cliente', 'administrador', 'Cliente', 'Administrador'], {
    // ou transforme antes
    message:
      'Campo "nivel_usuario" deve ser um nível de usuário válido, "cliente" ou "administrador"',
  })
  @ApiPropertyOptional({
    description: 'Nível do usuário para filtrar os resultados',
    example: 'cliente',
    enum: ['cliente', 'administrador'],
  })
  declare nivel_usuario?: 'cliente' | 'administrador';
}
