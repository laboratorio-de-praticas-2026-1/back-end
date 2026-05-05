import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

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

const parseOptionalNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return Number(value);
};

const parseOptionalArray = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [value];
};

const parseOptionalBoolean = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }

  return Boolean(value);
};

const parseOptionalString = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return String(value);
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
    typeof value === 'string'
      ? value.toLowerCase()
      : (value as unknown),
  )
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: SolicitacaoOrder = 'desc';

  @ApiPropertyOptional({
  description: 'Filtrar por status da solicitação',
  example: 'Recebido',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por um ou mais status da solicitação',
    example: ['recebido', 'em_andamento'],
    isArray: true,
  })
  @Transform(({ value }: TransformFnParams) => parseOptionalArray(value))
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status_in?: string[];

  @ApiPropertyOptional({
    description: 'Filtrar solicitações concluídas ou não concluídas',
    example: true,
  })
  @Transform(({ value }: TransformFnParams) => parseOptionalBoolean(value))
  @IsOptional()
  @IsBoolean()
  concluida?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar pelo identificador do usuário',
    example: 10,
  })
  @Transform(({ value }: TransformFnParams) => parseOptionalNumber(value))
  @IsOptional()
  @IsInt()
  usuario_id?: number;

  @ApiPropertyOptional({
    description: 'Filtrar pelo identificador do serviço',
    example: 20,
  })
  @Transform(({ value }: TransformFnParams) => parseOptionalNumber(value))
  @IsOptional()
  @IsInt()
  servico_id?: number;

  @ApiPropertyOptional({
    description: 'Filtrar pelo identificador do veículo',
    example: 30,
  })
  @Transform(({ value }: TransformFnParams) => parseOptionalNumber(value))
  @IsOptional()
  @IsInt()
  veiculo_id?: number;

  @ApiPropertyOptional({
    description: 'Filtrar pelo nome do cliente',
    example: 'Amanda',
  })
  @Transform(({ value }: TransformFnParams) => parseOptionalString(value))
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por CPF ou CNPJ do cliente',
    example: '12345678901',
  })
  @Transform(({ value }: TransformFnParams) => parseOptionalString(value))
  @IsOptional()
  @IsString()
  cpf_cnpj?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solicitações com data de solicitação inicial',
    example: '2026-04-01',
  })
  @Transform(({ value }: TransformFnParams) => parseOptionalString(value))
  @IsOptional()
  @IsString()
  data_solicitacao_inicio?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solicitações com data de solicitação final',
    example: '2026-04-30',
  })
  @Transform(({ value }: TransformFnParams) => parseOptionalString(value))
  @IsOptional()
  @IsString()
  data_solicitacao_fim?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solicitações com data de conclusão inicial',
    example: '2026-05-01',
  })
  @Transform(({ value }: TransformFnParams) => parseOptionalString(value))
  @IsOptional()
  @IsString()
  data_conclusao_inicio?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solicitações com data de conclusão final',
    example: '2026-05-31',
  })
  @Transform(({ value }: TransformFnParams) => parseOptionalString(value))
  @IsOptional()
  @IsString()
  data_conclusao_fim?: string;
}