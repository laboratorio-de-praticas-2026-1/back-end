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
    // forwardRef necessário para resolver dependência circular Gateway <-> Service
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

  // ─── Bloco de teste — REMOVER antes de ir para produção ──────
  // Agora chama o service real, que persiste no banco e emite via socket
  @SubscribeMessage('me_mande_um_teste')
  async handleTest(client: Socket, _data: unknown) {
    this.logger.log(`Teste solicitado pelo cliente ${client.id}`);
    await this.notificacaoService.notificarVencimentoCNH(1, 5);
    await this.notificacaoService.notificarLicenciamentoProximo(1, 'ABC-1234', 10);
    await this.notificacaoService.notificarNovoDebito(1, 'ABC-1234', 150.5);
  }
}
