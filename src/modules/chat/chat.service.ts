import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { AuthService, JwtUserPayload } from '../../commons/auth.service';
import { ChatMessage, UserData } from './utils/types';

// ================= SERVICE =================
@Injectable()
export class ChatService {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {}

  private broadcastToAgents?: (data: unknown) => void;
  private broadcastAgentsList?: () => void;

  users: Record<string, UserData> = {};
  agents: Record<string, Socket> = {};
  history: Record<string, ChatMessage[]> = {};
  timeouts: Record<string, NodeJS.Timeout> = {};

  private INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 min

  // ================= CALLBACKS =================
  setBroadcastCallbacks(
    broadcastToAgents: (data: unknown) => void,
    broadcastAgentsList: () => void,
  ) {
    this.broadcastToAgents = broadcastToAgents;
    this.broadcastAgentsList = broadcastAgentsList;
  }

  // ================= TOKEN =================
  verifyToken(token?: string): JwtUserPayload | null {
    return this.authService.verifyToken(token);
  }

  // ================= SOCKET =================
  send(socket: Socket, data: unknown) {
    if (!socket.connected) return;
    try {
      socket.emit('chat', data);
    } catch (err) {
      this.logger.error('Erro ao enviar mensagem via socket', err);
    }
  }

  broadcastAgents(data: unknown, excludeAgentId?: string) {
    if (this.broadcastToAgents) {
      this.broadcastToAgents(data);
    } else {
      // Fallback to direct socket sending if callback not set
      for (const [id, agent] of Object.entries(this.agents)) {
        if (excludeAgentId && id === excludeAgentId) continue;

        if (agent.connected) {
          this.send(agent, data);
        }
      }
    }
  }

  // ================= USERS =================
  addUser(socket: Socket, nome: string) {
    const userId = this.getNextUserId();

    this.users[userId] = {
      socket,
      nome,
      lastActivity: Date.now(),
    };

    this.history[userId] = [];

    this.resetTimeout(userId);
    // broadcastAgentsList will be called by gateway

    return userId;
  }

  addAgent(agentId: string, socket: Socket) {
    this.agents[agentId] = socket;
    // broadcastAgentsList will be called by gateway
  }

  getNextUserId() {
    return `user-${randomUUID().slice(0, 8)}`;
  }

  updateUserActivity(userId: string) {
    if (!this.users[userId]) return;

    this.users[userId].lastActivity = Date.now();
    this.resetTimeout(userId);
  }

  // ================= TIMEOUT =================
  private resetTimeout(userId: string) {
    if (this.timeouts[userId]) {
      clearTimeout(this.timeouts[userId]);
    }

    this.timeouts[userId] = setTimeout(() => {
      this.endUserSession(userId, 'timeout');
    }, this.INACTIVITY_TIMEOUT);
  }

  clearUserTimeout(userId: string) {
    if (this.timeouts[userId]) {
      clearTimeout(this.timeouts[userId]);
      delete this.timeouts[userId];
    }
  }

  // ================= HISTORY =================
  addMessageToHistory(userId: string, msg: ChatMessage) {
    if (!this.history[userId]) {
      this.history[userId] = [];
    }

    this.history[userId].push(msg);

    if (this.history[userId].length > 100) {
      this.history[userId] = this.history[userId].slice(-100);
    }
  }

  // ================= SESSION =================
  endUserSession(userId: string, reason = 'disconnect') {
    const user = this.users[userId];
    if (!user) return;

    if (this.broadcastToAgents) {
      this.broadcastToAgents({
        type: 'userDisconnected',
        userId,
        nome: user.nome,
        reason,
      });
    }

    if (user.socket.connected) {
      user.socket.disconnect(true);
    }

    this.clearUserTimeout(userId);

    delete this.users[userId];
    delete this.history[userId];

    this.broadcastAgentsList();
  }

  // ================= LIST =================
  broadcastAgentsList() {
    if (this.broadcastAgentsList) {
      this.broadcastAgentsList();
    }
  }
}
