import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSolicitacaoStatusDto {
  @ApiProperty({
    description: 'Status da solicitação',
    enum: [
      'recebido',
      'aguardando_pagamento',
      'aguardando_documento',
      'em_andamento',
      'concluido',
      'cancelado',
    ],
    example: 'em_andamento',
  })
  @IsEnum(
    [
      'recebido',
      'aguardando_pagamento',
      'aguardando_documento',
      'em_andamento',
      'concluido',
      'cancelado',
    ],
    {
      message:
        'Status deve ser um dos seguintes: recebido, aguardando_pagamento, aguardando_documento, em_andamento, concluido, cancelado',
    },
  )
  status:
    | 'recebido'
    | 'aguardando_pagamento'
    | 'aguardando_documento'
    | 'em_andamento'
    | 'concluido'
    | 'cancelado';

  @ApiPropertyOptional({
    description: 'Observação administrativa sobre a atualização',
    example: 'Solicitação confirmada pelo administrador',
  })
  @IsOptional()
  @IsString({ message: 'Observação administrativa deve ser uma string' })
  @Transform(({ value }: { value: unknown }): string | undefined => {
    return typeof value === 'string' && value.trim() !== '' ? value : undefined;
  })
  observacaoAdmin?: string;
}
