// src/notificacao/notificacao.controller.ts

import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';

@Controller('api/notificacoes')
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}

  /**
   * GET /api/notificacoes/usuario/:usuarioId
   * Retorna todas as notificações ativas de um usuário (do banco em tempo real)
   */
  @Get('usuario/:usuarioId')
  async buscarNotificacoes(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.notificacaoService.buscarNotificacoesDoUsuario(usuarioId);
  }

  /**
   * GET /api/notificacoes/usuario/:usuarioId/configuracoes
   * Retorna as configurações de notificação do usuário
   */
  @Get('usuario/:usuarioId/configuracoes')
  async buscarConfiguracoes(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.notificacaoService.buscarConfiguracoes(usuarioId);
  }

  /**
   * PATCH /api/notificacoes/usuario/:usuarioId/configuracoes
   * Atualiza configurações de notificação
   */
  @Patch('usuario/:usuarioId/configuracoes')
  @HttpCode(HttpStatus.OK)
  async atualizarConfiguracoes(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Body() configuracoes: any,
  ) {
    return this.notificacaoService.atualizarConfiguracoes(usuarioId, configuracoes);
  }

  /**
   * PATCH /api/notificacoes/usuario/:usuarioId/data-cnh
   * Atualiza data de vencimento de CNH
   */
  @Patch('usuario/:usuarioId/data-cnh')
  @HttpCode(HttpStatus.OK)
  async atualizarDataCNH(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Body() body: { dataVencimento: string },
  ) {
    return this.notificacaoService.atualizarDataVencimentoCNH(
      usuarioId,
      new Date(body.dataVencimento),
    );
  }

  /**
   * PATCH /api/notificacoes/veiculo/:veiculoId/licenciamento
   * Atualiza data de licenciamento do veículo
   */
  @Patch('veiculo/:veiculoId/licenciamento')
  @HttpCode(HttpStatus.OK)
  async atualizarLicenciamento(
    @Param('veiculoId', ParseIntPipe) veiculoId: number,
    @Body() body: { dataVencimento: string },
  ) {
    return this.notificacaoService.atualizarDataLicenciamento(
      veiculoId,
      new Date(body.dataVencimento),
    );
  }

  /**
   * PATCH /api/notificacoes/veiculo/:veiculoId/debito
   * Atualiza débito do veículo
   */
  @Patch('veiculo/:veiculoId/debito')
  @HttpCode(HttpStatus.OK)
  async atualizarDebito(
    @Param('veiculoId', ParseIntPipe) veiculoId: number,
    @Body() body: { valor: number; descricao?: string },
  ) {
    return this.notificacaoService.atualizarDebito(veiculoId, body.valor, body.descricao);
  }

  /**
   * DELETE /api/notificacoes/veiculo/:veiculoId/debito
   * Remove débito do veículo
   */
  @Post('veiculo/:veiculoId/debito/limpar')
  @HttpCode(HttpStatus.OK)
  async limparDebito(@Param('veiculoId', ParseIntPipe) veiculoId: number) {
    return this.notificacaoService.limparDebito(veiculoId);
  }

  /**
   * POST /api/notificacoes/enviar-email
   * Envia notificação por email
   */
  @Post('enviar-email')
  @HttpCode(HttpStatus.OK)
  async enviarEmail(@Body() notificacao: any) {
    const enviado = await this.notificacaoService.enviarNotificacao(notificacao);
    return { enviado, mensagem: enviado ? 'Email enviado com sucesso' : 'Falha ao enviar email' };
  }
}
