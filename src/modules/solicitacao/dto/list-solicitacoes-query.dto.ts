import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

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

export type SolicitacaoOrderBy = (typeof SOLICITACAO_ORDER_BY_FIELDS)[number];
export type SolicitacaoOrder = 'asc' | 'desc';

export const SOLICITACAO_ORDER_BY_COLUMN: Record<SolicitacaoOrderBy, string> = {
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
  @Transform(({ value }: TransformFnParams) => parseNumberOrDefault(value, 1))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de registros por pagina',
    example: 10,
    default: 10,
    minimum: 1,
  })
  @Transform(({ value }: TransformFnParams) => parseNumberOrDefault(value, 10))
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
    typeof value === 'string' ? value.toLowerCase() : (value as unknown),
  )
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: SolicitacaoOrder = 'desc';
}
