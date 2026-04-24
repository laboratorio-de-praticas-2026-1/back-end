import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StatusSolicitacaoEnum } from 'src/commons/enums/status-solicitacao.enum';

export class ListSolicitacoesQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID do usuário', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare usuario_id?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID do serviço', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare servico_id?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID do veículo', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare veiculo_id?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por status único',
    enum: StatusSolicitacaoEnum,
    example: StatusSolicitacaoEnum.EM_ANDAMENTO,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim().toLowerCase() : undefined,
  )
  @IsEnum(StatusSolicitacaoEnum, {
    message: `Status inválido. Valores permitidos: ${Object.values(StatusSolicitacaoEnum).join(', ')}`,
  })
  declare status?: StatusSolicitacaoEnum;

  @ApiPropertyOptional({
    description: 'Filtrar por lista de status (CSV ou array)',
    enum: StatusSolicitacaoEnum,
    isArray: true,
    example: [StatusSolicitacaoEnum.RECEBIDO, StatusSolicitacaoEnum.CANCELADO],
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams): string[] | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const valores = Array.isArray(value)
      ? value.flatMap((item) => String(item).split(','))
      : String(value).split(',');

    const normalizados = valores
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);

    return normalizados.length > 0 ? normalizados : undefined;
  })
  @IsArray()
  @IsEnum(StatusSolicitacaoEnum, {
    each: true,
    message: `Status inválido em status_in. Valores permitidos: ${Object.values(StatusSolicitacaoEnum).join(', ')}`,
  })
  declare status_in?: StatusSolicitacaoEnum[];

  @ApiPropertyOptional({
    description: 'Data inicial de solicitação (inclusiva)',
    example: '2026-04-01',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'data_solicitacao_inicio deve ser uma data válida' },
  )
  declare data_solicitacao_inicio?: string;

  @ApiPropertyOptional({
    description: 'Data final de solicitação (inclusiva)',
    example: '2026-04-30',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'data_solicitacao_fim deve ser uma data válida' },
  )
  declare data_solicitacao_fim?: string;

  @ApiPropertyOptional({
    description: 'Data inicial de conclusão (inclusiva)',
    example: '2026-05-01',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'data_conclusao_inicio deve ser uma data válida' },
  )
  declare data_conclusao_inicio?: string;

  @ApiPropertyOptional({
    description: 'Data final de conclusão (inclusiva)',
    example: '2026-05-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'data_conclusao_fim deve ser uma data válida' })
  declare data_conclusao_fim?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por situação de conclusão',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }): boolean | undefined => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
  })
  @IsBoolean({ message: 'concluida deve ser true ou false' })
  declare concluida?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por nome do cliente (parcial)',
    example: 'Amanda',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  declare nome?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por CPF/CNPJ do cliente (parcial)',
    example: '12345678901',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  declare cpf_cnpj?: string;
}
