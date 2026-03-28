import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { dentroHorario } from './utils/timeUtils';
import {
  ChatMessage,
  IncomingMessage,
  UserRole,
  AuthSocket,
} from './utils/types';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly logger: Logger,
  ) {
    // Set up broadcast callbacks for the service
    this.chatService.setBroadcastCallbacks(
      (data) => this.server.to(this.AGENTS_ROOM).emit('chat', data),
      () => this.broadcastAgentsList(),
    );
  }

  @WebSocketServer()
  server: Server;

  private readonly AGENTS_ROOM = 'chat:agents';

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

  handleConnection(_socket: AuthSocket) {
    // Connection established, authentication will be handled via events
  }

  @SubscribeMessage('chat')
  handleChat(
    @MessageBody() payload: unknown,
    @ConnectedSocket() socket: AuthSocket,
  ) {
    let data: IncomingMessage;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data =
        typeof payload === 'string'
          ? JSON.parse(payload)
          : (payload as IncomingMessage);
    } catch (err: unknown) {
      this.logger.error(
        'JSON inválido',
        err instanceof Error ? err.stack : String(err),
      );

      this.chatService.send(socket, { error: 'Mensagem inválida' });
      return;
    }

    if (data.type === 'connect') {
      this.handleConnect(socket, data);
    }

    if (data.type === 'message') {
      this.handleMessage(socket, data);
    }
  }

  // ================= CONNECT =================
  private handleConnect(socket: AuthSocket, data: IncomingMessage) {
    const decoded = this.chatService.verifyToken(data.token);

    if (!decoded) {
      socket.disconnect(true);
      return;
    }

    const roleMap: Record<number, UserRole> = {
      0: UserRole.AGENT,
      1: UserRole.USER,
    };

    const role = roleMap[decoded.nivel];

    if (!role) {
      socket.disconnect(true);
      return;
    }

    socket.role = role;

    const nomeUsuario =
      decoded.nome || data.nome || decoded.email || `Usuario ${decoded.id}`;

    // ================= USER =================
    if (role === UserRole.USER) {
      const userId = this.chatService.addUser(socket, nomeUsuario);

      socket.userId = userId;
      socket.join(this.userRoom(userId));

      void this.chatService.send(socket, {
        type: 'status',
        msg: `✅ Conectado como ${nomeUsuario}`,
      });

      void this.chatService.send(socket, {
        type: 'history',
        messages: this.chatService.history[userId],
      });

      this.broadcastAgentsList();
    }

    // ================= AGENT =================
    if (role === UserRole.AGENT) {
      const agentId = String(decoded.id);

      socket.userId = agentId;

      this.chatService.addAgent(agentId, socket);
      socket.join(this.AGENTS_ROOM);

      void this.chatService.send(socket, {
        type: 'status',
        msg: 'Conectado como atendente.',
      });

      this.broadcastAgentsList();
    }
  }

  // ================= MESSAGE =================
  private handleMessage(socket: AuthSocket, data: IncomingMessage) {
    const role = socket.role;
    const currentId = socket.userId;

    if (!role || !currentId) return;

    const horario = dentroHorario();

    if (!horario.ok) {
      this.chatService.send(socket, {
        type: 'status',
        msg: horario.message || 'Atendimento indisponível',
      });
      return;
    }

    if (!data.text || data.text.trim() === '') {
      this.chatService.send(socket, {
        type: 'error',
        msg: 'Mensagem inválida',
      });
      return;
    }

    const timestamp = new Date().toISOString();

    // ================= USER =================
    if (role === UserRole.USER) {
      const user = this.chatService.users[currentId];
      if (!user) return;

      const newMsg: ChatMessage = {
        userId: currentId,
        fromUserId: currentId,
        nome: user.nome,
        text: data.text,
        timestamp,
      };

      this.chatService.addMessageToHistory(currentId, newMsg);
      this.chatService.updateUserActivity(currentId);

      this.chatService.broadcastAgents({
        type: 'message',
        userId: currentId,
        nome: user.nome,
        text: data.text,
        timestamp,
      });
    }

    // ================= AGENT =================
    if (role === UserRole.AGENT) {
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
        fromUserId: currentId,
        nome: 'Atendente',
        text: data.text,
        timestamp,
      };

      this.chatService.addMessageToHistory(targetUser, newMsg);

      this.server.to(this.userRoom(targetUser)).emit('chat', {
        type: 'message',
        text: data.text,
        timestamp,
      });
    }
  }

  // ================= DISCONNECT =================
  handleDisconnect(socket: AuthSocket) {
    if (socket.role === UserRole.AGENT) {
      // grafo de agentes é mantido por room 'chat:agents'.
      // ao desconectar, apenas broadcast de lista atualizada.
      this.broadcastAgentsList();
      return;
    }

    const userEntry = Object.entries(this.chatService.users).find(
      ([_, data]) => data.socket === socket,
    );

    if (userEntry) {
      const [userId] = userEntry;
      this.chatService.endUserSession(userId, 'disconnect');
    }
  }
}
