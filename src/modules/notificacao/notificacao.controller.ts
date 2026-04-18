import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';

@Controller('notificacao')
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}

  @Get(':userId')
  async getUserNotifications(@Param('userId') userId: string) {
    if (!userId || isNaN(Number(userId)) || Number(userId) <= 0) {
      throw new BadRequestException('userId deve ser um número válido');
    }

    try {
      const notificacoes = await this.notificacaoService.getUserNotifications(
        Number(userId),
      );

      if (notificacoes.length === 0) {
        return {
          message: 'Nenhuma notificação de débito pendente',
          notificacoes: [],
        };
      }

      return {
        message: 'Notificações recuperadas com sucesso',
        total: notificacoes.length,
        notificacoes,
      };
    } catch (error) {
      throw new BadRequestException(
        `Erro ao recuperar notificações: ${error.message}`,
      );
    }
  }
}
