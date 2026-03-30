// src/notificacao/notificacao.controller.ts

import { Controller, Get, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';

@Controller('notificacao')
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}

  /**
   * GET /notificacao/usuario/:usuarioId
   * Retorna todas as notificações de um usuário, da mais recente para a mais antiga.
   */
  @Get('usuario/:usuarioId')
  async buscarPorUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.notificacaoService.buscarNotificacoesPorUsuario(usuarioId);
  }

  /**
   * PATCH /notificacao/:id/lida
   * Marca uma notificação específica como lida.
   */
  @Patch(':id/lida')
  async marcarComoLida(@Param('id', ParseIntPipe) id: number) {
    return this.notificacaoService.marcarComoLida(id);
  }
}
