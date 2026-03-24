import {WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';

import { Server, WebSocket, RawData } from 'ws';
import { ChatService } from './chat.service';
import { dentroHorario } from './utils/timeUtils';
import { logError } from './utils/logger';

interface JwtUserPayload {
  id: number;
  nivel: number;
  nome?: string;
  email?: string;
}

interface AuthWebSocket extends WebSocket {
  userData?: JwtUserPayload;
  role?: 'agent' | 'user';
  userId?: string; // 🔥 AGORA STRING
}

interface ChatMessage {
  userId: string;
  fromUserId: string | number;
  nome: string;
  text: string;
  timestamp: string;
}

interface IncomingMessage {
  type: 'connect' | 'message';
  token?: string;
  nome?: string;
  text?: string;
  to?: string;
}

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(ws: AuthWebSocket) {
    ws.on('message', (msg: RawData) => {
      let data: IncomingMessage;

      try {
        data = JSON.parse(msg.toString());
      } catch (err: any) {
        logError({
          message: 'JSON inválido',
          stack: err.stack,
        });

        this.chatService.send(ws, { error: 'Mensagem inválida' });
        return;
      }

      if (data.type === 'connect') {
        this.handleConnect(ws, data);
      }

      if (data.type === 'message') {
        this.handleMessage(ws, data);
      }
    });
  }

  // ================= CONNECT =================
  private handleConnect(ws: AuthWebSocket, data: IncomingMessage) {
    const decoded = this.chatService.verifyToken(data.token);

    if (!decoded) {
      ws.close(4002, 'Token inválido');
      return;
    }

    const roleMap: Record<number, 'agent' | 'user'> = {
      0: 'agent',
      1: 'user',
    };

    const role = roleMap[decoded.nivel];

    if (!role) {
      ws.close(4003, 'Role inválido');
      return;
    }

    ws.role = role;

    const nomeUsuario =
      decoded.nome ||
      data.nome ||
      decoded.email ||
      `Usuario ${decoded.id}`;

    // ================= USER =================
    if (role === 'user') {
      const userId = this.chatService.addUser(ws, nomeUsuario);

      ws.userId = userId;

      this.chatService.send(ws, {
        type: 'status',
        msg: `✅ Conectado como ${nomeUsuario}`,
      });

      this.chatService.send(ws, {
        type: 'history',
        messages: this.chatService.history[userId],
      });
    }

    // ================= AGENT =================
    if (role === 'agent') {
      const agentId = String(decoded.id);

      ws.userId = agentId;

      this.chatService.addAgent(agentId, ws);

      this.chatService.send(ws, {
        type: 'status',
        msg: 'Conectado como atendente.',
      });
    }
  }

  // ================= MESSAGE =================
  private handleMessage(ws: AuthWebSocket, data: IncomingMessage) {
    const role = ws.role;
    const currentId = ws.userId;

    if (!role || !currentId) return;

    const horario = dentroHorario();

    if (horario !== true) {
      this.chatService.send(ws, {
        type: 'status',
        msg: horario,
      });
      return;
    }

    if (!data.text || data.text.trim() === '') {
      this.chatService.send(ws, {
        type: 'error',
        msg: 'Mensagem inválida',
      });
      return;
    }

    const timestamp = new Date().toISOString();

    // ================= USER =================
    if (role === 'user') {
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
    if (role === 'agent') {
      const targetUser = data.to;

      if (!targetUser || !this.chatService.users[targetUser]) {
        this.chatService.send(ws, {
          type: 'status',
          msg: `Usuário não está online.`,
        });
        return;
      }

      const newMsg: ChatMessage = {
        userId: currentId,
        fromUserId: currentId,
        nome: 'Atendente',
        text: data.text,
        timestamp,
      };

      this.chatService.addMessageToHistory(targetUser, newMsg);

      this.chatService.send(
        this.chatService.users[targetUser].ws,
        {
          type: 'message',
          text: data.text,
          timestamp,
        },
      );
    }
  }

  // ================= DISCONNECT =================
  handleDisconnect(ws: AuthWebSocket) {
    const agentEntry = Object.entries(this.chatService.agents).find(
      ([_, socket]) => socket === ws,
    );

    if (agentEntry) {
      const [agentId] = agentEntry;
      delete this.chatService.agents[agentId];
      return;
    }

    const userEntry = Object.entries(this.chatService.users).find(
      ([_, data]) => data.ws === ws,
    );

    if (userEntry) {
      const [userId] = userEntry;
      this.chatService.endUserSession(userId, 'disconnect'); // 🔥 agora string
    }
  }
}
