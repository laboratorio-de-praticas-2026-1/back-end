import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SolicitacaoStatus {
  RECEBIDO = 'recebido',
  AGUARDANDO_PAGAMENTO = 'aguardando_pagamento',
  AGUARDANDO_DOCUMENTO = 'aguardando_documento',
  EM_ANDAMENTO = 'em_andamento',
  CONCLUIDO = 'concluido',
  CANCELADO = 'cancelado',
}

export class UpdateSolicitacaoStatusDto {
  @ApiProperty({
    description: 'Status da solicitação',
    enum: SolicitacaoStatus,
    enumName: 'SolicitacaoStatus',
    example: 'em_andamento'
  })
  @IsEnum(SolicitacaoStatus, {
    message: 'Status deve ser um dos seguintes: recebido, aguardando_pagamento, aguardando_documento, em_andamento, concluido, cancelado',
  })
  status: SolicitacaoStatus;

  @ApiPropertyOptional({
    description: 'Observação administrativa sobre a atualização',
    example: 'Solicitação confirmada pelo administrador'
  })
  @IsOptional()
  @IsString({ message: 'Observação administrativa deve ser uma string' })
  @Transform(({ value }) => value || undefined)
  observacaoAdmin?: string;

  @ApiPropertyOptional({
    description: 'Observação administrativa sobre a atualização (formato snake_case)',
    example: 'Solicitação confirmada pelo administrador'
  })
  @IsOptional()
  @IsString({ message: 'Observação administrativa deve ser uma string' })
  @Transform(({ value }) => {
    return value || undefined;
  })
  observacao_admin?: string;
}
