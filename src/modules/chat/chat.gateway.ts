import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthService } from 'src/commons/auth.service';
import { ChatService } from './chat.service';
import { dentroHorario } from './utils/timeUtils';
import { ChatMessage, IncomingMessage } from './utils/types';
import { NivelUsuarioEnum } from 'src/commons/constantes/nivel-usuario-enum';
import type { AuthSocket } from './utils/types';
import { sanitizeChatPlainText } from './utils/sanitize';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly logger: Logger,
    private readonly authService: AuthService,
  ) {
    this.chatService.setBroadcastCallbacks(
      (data) => this.server.to(this.AGENTS_ROOM).emit('chat', data),
      () => this.broadcastAgentsList(),
    );
  }

  @WebSocketServer()
  server: Server;

  private readonly AGENTS_ROOM = 'chat:agents';

  private messageTimestamps: Map<string, number[]> = new Map();
  private lastMessageTime: Map<string, number> = new Map();

  private readonly MAX_MESSAGES_PER_MINUTE = 10;
  private readonly COOLDOWN_MS = 3000;
  private readonly DUPLICATE_WINDOW_MS = 10000;

  async handleConnection(socket: AuthSocket) {
    const token = (socket.handshake.auth?.token ||
      socket.handshake.headers?.token) as string;

    const decoded = this.authService.verifyToken(token);

    if (!decoded) {
      socket.disconnect(true);
      return;
    }

    if (!decoded.id || !decoded.nivel) {
      socket.disconnect(true);
      return;
    }

    try {
      const usuario = await this.chatService.buscarUsuarioPeloId(
        String(decoded.id),
      );

      if (
        !usuario ||
        usuario.nivel !== (decoded.nivel as typeof usuario.nivel)
      ) {
        socket.disconnect(true);
        return;
      }

      if (usuario.nivel === NivelUsuarioEnum.administrador.toString()) {
        socket.role = NivelUsuarioEnum.administrador;
        await socket.join(this.AGENTS_ROOM);

        const agentId = String(decoded.id);
        socket.userId = agentId;
        this.chatService.addAgent(agentId, socket);

        void this.chatService.send(socket, {
          type: 'status',
          msg: 'Conectado como atendente.',
        });

        this.replayInMemoryHistoryToAgent(socket);

        this.broadcastAgentsList();
        return;
      }

      socket.role = NivelUsuarioEnum.cliente;
      socket.name = usuario.nome || `Cliente ${decoded.id}`;

      const previousSession = this.chatService.findSessionIdByAuthUserId(
        decoded.id,
      );
      if (previousSession) {
        this.chatService.endUserSession(previousSession, 'reconnect');
      }

      await socket.join(this.userRoom(String(decoded.id)));

      const userIdGerado = this.chatService.addUser(
        socket,
        socket.name,
        decoded.id,
      );
      socket.userId = userIdGerado;
      await socket.join(this.userRoom(userIdGerado));

      void this.chatService.send(socket, {
        type: 'session',
        chatUserId: userIdGerado,
      });

      void this.chatService.send(socket, {
        type: 'status',
        msg: `✅ Conectado como ${socket.name}`,
      });

      void this.chatService.send(socket, {
        type: 'history',
        messages: this.chatService.history[userIdGerado] ?? [],
      });

      this.broadcastAgentsList();
    } catch (err: unknown) {
      this.logger.error(
        'Erro na conexão do chat',
        err instanceof Error ? err.stack : String(err),
      );
      socket.disconnect(true);
    }
  }

  /** Histórico em RAM para atendentes que conectam depois (sem persistência). */
  private replayInMemoryHistoryToAgent(agentSocket: AuthSocket) {
    for (const [sessionId] of Object.entries(this.chatService.users)) {
      const msgs = this.chatService.history[sessionId] ?? [];
      if (msgs.length === 0) continue;
      this.chatService.send(agentSocket, {
        type: 'history_for_user',
        userId: sessionId,
        messages: msgs,
      });
    }
  }

  private userRoom(userId: string) {
    return `chat:user:${userId}`;
  }

  private broadcastAgentsList() {
    const userList = Object.entries(this.chatService.users).map(([id, u]) => ({
      userId: id,
      nome: u.nome,
    }));

    this.server.to(this.AGENTS_ROOM).emit('chat', {
      type: 'users',
      users: userList,
    });

    const room = this.server.sockets.adapter.rooms.get(this.AGENTS_ROOM);
    const agents = room
      ? [...room]
          .map((socketId) => this.server.sockets.sockets.get(socketId))
          .filter((s): s is AuthSocket => !!s && !!(s as AuthSocket).userId)
          .map((s) => s.userId)
      : [];

    this.server.to(this.AGENTS_ROOM).emit('chat', {
      type: 'agents',
      agents,
    });
  }

  @SubscribeMessage('chat')
  handleChat(
    @MessageBody() payload: unknown,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    let data: IncomingMessage;

    try {
      const parsed: unknown =
        typeof payload === 'string' ? JSON.parse(payload) : payload;
      data = parsed as IncomingMessage;
    } catch (err: unknown) {
      this.logger.error(
        'JSON inválido',
        err instanceof Error ? (err.stack ?? err.message) : String(err),
      );
      socket.emit('chat', { error: 'Mensagem inválida' });
      return;
    }

    if (data.type === 'resync') {
      if (socket.role === NivelUsuarioEnum.cliente && socket.userId) {
        const msgs = this.chatService.history[socket.userId] ?? [];
        void this.chatService.send(socket, { type: 'history', messages: msgs });
      }
      return;
    }

    if (data.type === 'admin_resync') {
      if (socket.role === NivelUsuarioEnum.administrador) {
        const userList = Object.entries(this.chatService.users).map(
          ([id, u]) => ({
            userId: id,
            nome: u.nome,
          }),
        );
        void this.chatService.send(socket, {
          type: 'users',
          users: userList,
        });
        this.replayInMemoryHistoryToAgent(socket);
      }
      return;
    }

    const skipHours = process.env.CHAT_SKIP_BUSINESS_HOURS === 'true';
    if (!skipHours && data.type === 'message') {
      const horario = dentroHorario();

      if (!horario.ok) {
        socket.emit('chat', {
          type: 'status',
          msg: horario.message,
        });

        socket.disconnect(true);
        return;
      }
    }

    if (data.type === 'message') {
      void this.handleMessage(socket, data);
    }
  }

  private handleMessage(socket: AuthSocket, data: IncomingMessage) {
    const role = socket.role;
    const userId = socket.userId;

    if (!role || !userId) return;

    if (!data.text) {
      this.chatService.send(socket, {
        type: 'error',
        msg: 'Mensagem vazia não é permitida.',
      });
      return;
    }

    const normalizedText = data.text.replace(/\s+/g, ' ').trim();

    if (normalizedText.length < 1 || normalizedText.length > 200) {
      this.chatService.send(socket, {
        type: 'error',
        msg: 'A mensagem deve ter entre 1 e 200 caracteres.',
      });
      return;
    }

    const sanitizedText = sanitizeChatPlainText(normalizedText);

    const now = Date.now();

    const lastTime = this.lastMessageTime.get(userId) || 0;
    if (now - lastTime < this.COOLDOWN_MS) {
      this.chatService.send(socket, {
        type: 'error',
        msg: 'Aguarde 3 segundos entre mensagens.',
      });
      return;
    }
    this.lastMessageTime.set(userId, now);

    const timestamps = this.messageTimestamps.get(userId) || [];
    const oneMinuteAgo = now - 60000;
    const recentMessages = timestamps.filter((t) => t > oneMinuteAgo);

    if (recentMessages.length >= this.MAX_MESSAGES_PER_MINUTE) {
      this.chatService.send(socket, {
        type: 'error',
        msg: 'Limite de 10 mensagens por minuto atingido.',
      });
      return;
    }

    recentMessages.push(now);
    this.messageTimestamps.set(userId, recentMessages);

    if (
      this.chatService.isDuplicateMessage(
        userId,
        sanitizedText,
        this.DUPLICATE_WINDOW_MS,
      )
    ) {
      this.chatService.send(socket, {
        type: 'error',
        msg: 'Mensagem duplicada enviada muito rápido.',
      });
      return;
    }

    const timestamp = new Date().toISOString();

    if (role === NivelUsuarioEnum.cliente) {
      const newMsg: ChatMessage = {
        userId: userId,
        fromUserId: userId,
        nome: socket.name || `Cliente ${userId}`,
        text: sanitizedText,
        timestamp,
      };

      this.chatService.addMessageToHistory(userId, newMsg);
      this.chatService.updateUserActivity(userId);
      this.chatService.broadcastAgents(newMsg);
    }

    if (role === NivelUsuarioEnum.administrador) {
      const targetUser = data.to;

      if (!targetUser || !this.chatService.users[targetUser]) {
        this.chatService.send(socket, {
          type: 'status',
          msg: `Usuário não está online.`,
        });
        return;
      }

      const newMsg: ChatMessage = {
        userId: targetUser,
        fromUserId: userId,
        nome: 'Atendente',
        text: sanitizedText,
        timestamp,
      };

      this.chatService.addMessageToHistory(targetUser, newMsg);

      this.server.to(this.userRoom(targetUser)).emit('chat', {
        type: 'message',
        text: sanitizedText,
        timestamp,
      });
    }
  }

  handleDisconnect(socket: AuthSocket) {
    if (socket.userId) {
      this.messageTimestamps.delete(socket.userId);
      this.lastMessageTime.delete(socket.userId);
    }

    if (socket.role === NivelUsuarioEnum.administrador) {
      if (socket.userId) {
        this.chatService.removeAgent(socket.userId);
      }
      this.broadcastAgentsList();
      return;
    }

    const userEntry = Object.entries(this.chatService.users).find(
      ([_, data]) => data.socket === socket,
    );

    if (userEntry) {
      const [uid] = userEntry;
      this.chatService.endUserSession(uid, 'disconnect');
    }
  }
}
