import { Controller, Get, Param } from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';

@Controller('notificacao')
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}

  @Get(':userId')
  async getUserNotifications(@Param('userId') userId: string) {
    return this.notificacaoService.getUserNotifications(Number(userId));
  }
}