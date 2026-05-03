import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusSolicitacaoEnum } from 'src/commons/enums/status-solicitacao.enum';

export class UpdateSolicitacaoStatusDto {
  @ApiProperty({
    description: 'Status da solicitação',
    enum: StatusSolicitacaoEnum,
    example: StatusSolicitacaoEnum.RECEBIDO,
  })
  @IsEnum(StatusSolicitacaoEnum, {
    message: `Status Inválido. Valores permitidos: ${StatusSolicitacaoEnum.RECEBIDO}, ${StatusSolicitacaoEnum.AGUARDANDO_PAGAMENTO}, ${StatusSolicitacaoEnum.AGUARDANDO_DOCUMENTO}, ${StatusSolicitacaoEnum.EM_ANDAMENTO}, ${StatusSolicitacaoEnum.CONCLUIDO}, ${StatusSolicitacaoEnum.CANCELADO}`,
  })
  status: StatusSolicitacaoEnum;

  @ApiPropertyOptional({
    description: 'Observação administrativa sobre a atualização',
    example: 'Solicitação confirmada pelo administrador',
  })
  @IsOptional()
  @IsString({ message: 'Observação administrativa deve ser um texto.' })
  @Transform(({ value }: { value: unknown }): string | undefined => {
    return typeof value === 'string' && value.trim() !== '' ? value : undefined;
  })
  observacaoAdmin?: string;
}
