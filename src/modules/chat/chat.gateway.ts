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

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly logger: Logger,
    private readonly authService: AuthService,
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

  async handleConnection(socket: AuthSocket) {
    const token = (socket.handshake.auth?.token ||
      socket.handshake.headers?.token) as string;

    const decoded = this.authService.verifyToken(token);

    if (!decoded) {
      socket.disconnect(true);
      return;
    }

    if (decoded.id && decoded.nivel) {
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

        this.broadcastAgentsList();
      } else {
        socket.role = NivelUsuarioEnum.cliente;
        socket.name = usuario.nome || `Cliente ${decoded.id}`;
        await socket.join(this.userRoom(String(decoded.id)));

        const userIdGerado = this.chatService.addUser(socket, socket.name);
        socket.userId = userIdGerado;
        await socket.join(this.userRoom(userIdGerado));

        void this.chatService.send(socket, {
          type: 'status',
          msg: `✅ Conectado como ${socket.name}`,
        });

        void this.chatService.send(socket, {
          type: 'history',
          messages: this.chatService.history[userIdGerado],
        });

        this.broadcastAgentsList();
      }
    }
  }

  private userRoom(userId: string) {
    return `chat:user:${userId}`;
  }

  private adminRoom(userId: string) {
    return `chat:admin:${userId}`;
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
    console.log('Sockets na room:', room);
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

    const horario = dentroHorario();

    if (!horario.ok) {
      socket.emit('chat', {
        type: 'status',
        msg: horario.message,
      });

      socket.disconnect(true);
      return;
    }

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

    if (data.type === 'message') {
      this.handleMessage(socket, data);
    }
  }

  private handleMessage(socket: AuthSocket, data: IncomingMessage) {
    const role = socket.role;
    const userId = socket.userId;

    if (!role || !userId) return;

    if (!data.text || data.text.trim() === '') {
      this.chatService.send(socket, {
        type: 'error',
        msg: 'Mande uma mensagem contendo alguma dúvida ou comentário para que possamos ajudar.',
      });
      return;
    }

    const timestamp = new Date().toISOString();

    // ================= CLIENTE =================
    if (role === NivelUsuarioEnum.cliente) {
      const newMsg: ChatMessage = {
        userId: userId,
        fromUserId: userId,
        nome: socket.name || `Cliente ${userId}`,
        text: data.text,
        timestamp,
      };

      this.chatService.addMessageToHistory(userId, newMsg);
      this.chatService.updateUserActivity(userId);

      this.chatService.broadcastAgents(newMsg);
    }

    // ================= ADMINISTRADOR =================
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
        userId: targetUser || 'unknown',
        fromUserId: userId,
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
    if (socket.role === NivelUsuarioEnum.administrador) {
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
