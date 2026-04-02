// src/notificacao/notificacao.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { NotificacaoService } from './notificacao.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificacaoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificacaoGateway.name);

  constructor(
    @Inject(forwardRef(() => NotificacaoService))
    private readonly notificacaoService: NotificacaoService,
  ) {}

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway inicializado');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /** Emite para TODOS os clientes conectados */
  enviarNotificacao(evento: string, dados: unknown): void {
    this.server.emit(evento, dados);
  }

  /** Emite apenas para um cliente específico via socketId */
  enviarNotificacaoParaCliente(socketId: string, evento: string, dados: unknown): void {
    this.server.to(socketId).emit(evento, dados);
  }

  // ─── Bloco de teste corrigido ──────
  @SubscribeMessage('me_mande_um_teste')
  async handleTest(client: Socket, data: { usuarioId?: number } = {}) {
    const usuarioId = data?.usuarioId || 1; // Usuário padrão para teste
    
    this.logger.log(`Teste solicitado pelo cliente ${client.id} para usuário ${usuarioId}`);
    
    try {
      // Busca todas as notificações do usuário
      const notificacoes = await this.notificacaoService.buscarNotificacoesDoUsuario(usuarioId);
      
      // Envia cada notificação encontrada
      for (const notificacao of notificacoes) {
        // Emite via socket
        client.emit('nova-notificacao', notificacao);
        
        // Envia email se configurado
        await this.notificacaoService.enviarNotificacao(notificacao);
        
        this.logger.log(`Notificação enviada: ${notificacao.tipo} - ${notificacao.titulo}`);
      }
      
      if (notificacoes.length === 0) {
        client.emit('teste-concluido', { message: 'Nenhuma notificação pendente encontrada' });
      } else {
        client.emit('teste-concluido', { message: `${notificacoes.length} notificações enviadas` });
      }
      
    } catch (error) {
      this.logger.error(`Erro no teste: ${error.message}`);
      client.emit('erro', { message: error.message });
    }
  }
  
  // Métodos adicionais úteis para o frontend
  @SubscribeMessage('verificar-minhas-notificacoes')
  async handleVerificarNotificacoes(client: Socket, data: { usuarioId: number }) {
    try {
      const notificacoes = await this.notificacaoService.buscarNotificacoesDoUsuario(data.usuarioId);
      
      for (const notificacao of notificacoes) {
        client.emit('nova-notificacao', notificacao);
        await this.notificacaoService.enviarNotificacao(notificacao);
      }
      
      client.emit('notificacoes-verificadas', { total: notificacoes.length });
    } catch (error) {
      client.emit('erro', { message: error.message });
    }
  }
}