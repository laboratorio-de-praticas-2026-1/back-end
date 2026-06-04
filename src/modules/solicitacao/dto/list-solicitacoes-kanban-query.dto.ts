import { OmitType } from '@nestjs/swagger';
import { ListSolicitacoesQueryDto } from './list-solicitacoes-query.dto';

export class ListSolicitacoesKanbanQueryDto extends OmitType(
  ListSolicitacoesQueryDto,
  ['page', 'limit'] as const,
) {}
