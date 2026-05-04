import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { ChatMessage, UserData } from './utils/types';
import { InjectModel } from '@nestjs/sequelize';
import { Usuario } from 'src/models/usuario.model';

// ================= SERVICE =================
@Injectable()
export class ChatService {
  constructor(
    private readonly logger: Logger,
    @InjectModel(Usuario) private usuarioModel: typeof Usuario,
  ) {}

  private broadcastToAgents?: (data: unknown) => void;
  private broadcastAgentsListCallback?: () => void;

  users: Record<string, UserData> = {};
  agents: Record<string, Socket> = {};
  history: Record<string, ChatMessage[]> = {};
  timeouts: Record<string, NodeJS.Timeout> = {};

  private lastMessages: Record<string, { text: string; timestamp: number }> =
    {};

  private readonly INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 min fixo em código

  setBroadcastCallbacks(
    broadcastToAgents: (data: unknown) => void,
    broadcastAgentsList: () => void,
  ) {
    this.broadcastToAgents = broadcastToAgents;
    this.broadcastAgentsListCallback = broadcastAgentsList;
  }

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
      for (const [id, agent] of Object.entries(this.agents)) {
        if (excludeAgentId && id === excludeAgentId) continue;

        if (agent.connected) {
          this.send(agent, data);
        }
      }
    }
  }

  isDuplicateMessage(userId: string, text: string, windowMs: number): boolean {
    const now = Date.now();
    const last = this.lastMessages[userId];

    const normalizedText = text.trim().toLowerCase();

    if (last) {
      const isSame = last.text === normalizedText;
      const isFast = now - last.timestamp < windowMs;

      if (isSame && isFast) {
        return true;
      }
    }

    this.lastMessages[userId] = {
      text: normalizedText,
      timestamp: now,
    };

    return false;
  }

  addUser(socket: Socket, nome: string, authUserId: number) {
    const userId = this.getNextUserId();

    this.users[userId] = {
      socket,
      nome,
      authUserId,
      lastActivity: Date.now(),
    };

    this.history[userId] = [];

    this.resetTimeout(userId);

    return userId;
  }

  /** Reconexão: mantém o mesmo `sessionId` e o histórico em memória. */
  rebindClientSocket(
    sessionId: string,
    socket: Socket,
    nome: string,
    authUserId: number,
  ): void {
    const previousSocket = this.users[sessionId]?.socket;

    this.users[sessionId] = {
      socket,
      nome,
      authUserId,
      lastActivity: Date.now(),
    };

    if (!this.history[sessionId]) {
      this.history[sessionId] = [];
    }

    this.resetTimeout(sessionId);

    if (
      previousSocket &&
      previousSocket !== socket &&
      previousSocket.connected
    ) {
      previousSocket.disconnect(true);
    }
  }

  addAgent(agentId: string, socket: Socket) {
    this.agents[agentId] = socket;
  }

  removeAgent(agentId: string) {
    delete this.agents[agentId];
    delete this.lastMessages[agentId];
  }

  getNextUserId() {
    return `user-${randomUUID().slice(0, 8)}`;
  }

  updateUserActivity(userId: string) {
    if (!this.users[userId]) return;

    this.users[userId].lastActivity = Date.now();
    this.resetTimeout(userId);
  }

  findSessionIdByAuthUserId(authUserId: number): string | undefined {
    return Object.entries(this.users).find(
      ([_, u]) => u.authUserId === authUserId,
    )?.[0];
  }

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

  addMessageToHistory(userId: string, msg: ChatMessage) {
    if (!this.history[userId]) {
      this.history[userId] = [];
    }

    this.history[userId].push(msg);

    if (this.history[userId].length > 100) {
      this.history[userId] = this.history[userId].slice(-100);
    }
  }

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
    delete this.lastMessages[userId];

    this.broadcastAgentsList();
  }

  broadcastAgentsList() {
    if (this.broadcastAgentsListCallback) {
      this.broadcastAgentsListCallback();
    }
  }

  async buscarUsuarioPeloId(userId: string): Promise<Usuario | null> {
    return this.usuarioModel.findByPk(userId);
  }
}
