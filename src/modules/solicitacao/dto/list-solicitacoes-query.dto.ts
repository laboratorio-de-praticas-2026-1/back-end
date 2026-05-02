import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StatusSolicitacaoEnum } from 'src/commons/enums/status-solicitacao.enum';

export const SOLICITACAO_ORDER_BY_FIELDS = [
  'id',
  'status',
  'usuarioId',
  'usuario_id',
  'servicoId',
  'servico_id',
  'veiculoId',
  'veiculo_id',
  'dataSolicitacao',
  'data_solicitacao',
  'dataConclusao',
  'data_conclusao',
] as const;

export type SolicitacaoOrderBy =
  (typeof SOLICITACAO_ORDER_BY_FIELDS)[number];

export type SolicitacaoOrder = 'asc' | 'desc';

export const SOLICITACAO_ORDER_BY_COLUMN: Record<
  SolicitacaoOrderBy,
  string
> = {
  id: 'id',
  status: 'status',
  usuarioId: 'usuarioId',
  usuario_id: 'usuarioId',
  servicoId: 'servicoId',
  servico_id: 'servicoId',
  veiculoId: 'veiculoId',
  veiculo_id: 'veiculoId',
  dataSolicitacao: 'dataSolicitacao',
  data_solicitacao: 'dataSolicitacao',
  dataConclusao: 'dataConclusao',
  data_conclusao: 'dataConclusao',
};

const parseNumberOrDefault = (value: unknown, defaultValue: number) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return Number(value);
};

export class ListSolicitacoesQueryDto {
  @ApiPropertyOptional({
    description: 'Pagina solicitada',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @Transform(({ value }: TransformFnParams) =>
    parseNumberOrDefault(value, 1),
  )
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de registros por pagina',
    example: 10,
    default: 10,
    minimum: 1,
  })
  @Transform(({ value }: TransformFnParams) =>
    parseNumberOrDefault(value, 10),
  )
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Campo utilizado para ordenar a lista',
    enum: SOLICITACAO_ORDER_BY_FIELDS,
    example: 'dataSolicitacao',
    default: 'dataSolicitacao',
  })
  @IsOptional()
  @IsIn(SOLICITACAO_ORDER_BY_FIELDS)
  orderBy: SolicitacaoOrderBy = 'dataSolicitacao';

  @ApiPropertyOptional({
    description: 'Direcao da ordenacao',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: SolicitacaoOrder = 'desc';

  @ApiPropertyOptional({
    description: 'Filtrar por status da solicitação',
    example: 'recebido',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID do usuário', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usuario_id?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID do serviço', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  servico_id?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID do veículo', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  veiculo_id?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por lista de status (CSV ou array)',
    enum: StatusSolicitacaoEnum,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
    }

    if (Array.isArray(value)) {
      return value
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
    }

    return value;
  })
  @IsArray()
  @IsEnum(StatusSolicitacaoEnum, { each: true })
  status_in?: StatusSolicitacaoEnum[];

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  data_solicitacao_inicio?: string;

  @ApiPropertyOptional({ example: '2026-04-30' })
  @IsOptional()
  @IsDateString()
  data_solicitacao_fim?: string;

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  data_conclusao_inicio?: string;

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsOptional()
  @IsDateString()
  data_conclusao_fim?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  })
  @IsBoolean()
  concluida?: boolean;

  @ApiPropertyOptional({ example: 'Amanda' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ example: '12345678901' })
  @IsOptional()
  @IsString()
  cpf_cnpj?: string;
}