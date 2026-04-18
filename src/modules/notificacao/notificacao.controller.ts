import { Controller } from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';

@Controller('notificacao')
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}
}
