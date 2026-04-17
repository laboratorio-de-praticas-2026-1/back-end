import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { AuthService } from '../../commons/auth.service';
import { ChatMessage, UserData } from './utils/types';
import { InjectModel } from '@nestjs/sequelize';
import { Usuario } from 'src/models/usuario.model';

// ================= SERVICE =================
@Injectable()
export class ChatService {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: Logger,
    @InjectModel(Usuario) private usuarioModel: typeof Usuario,
  ) {}

  private broadcastToAgents?: (data: unknown) => void;
  private broadcastAgentsListCallback?: () => void;

  users: Record<string, UserData> = {};
  agents: Record<string, Socket> = {};
  history: Record<string, ChatMessage[]> = {};
  timeouts: Record<string, NodeJS.Timeout> = {};

  // 🚨 NOVO: controle de última mensagem
  private lastMessages: Record<string, { text: string; timestamp: number }> =
    {};

  private INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 min

  // ================= CALLBACKS =================
  setBroadcastCallbacks(
    broadcastToAgents: (data: unknown) => void,
    broadcastAgentsList: () => void,
  ) {
    this.broadcastToAgents = broadcastToAgents;
    this.broadcastAgentsListCallback = broadcastAgentsList;
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
      for (const [id, agent] of Object.entries(this.agents)) {
        if (excludeAgentId && id === excludeAgentId) continue;

        if (agent.connected) {
          this.send(agent, data);
        }
      }
    }
  }

  // ================= 🚨 DETECÇÃO DE DUPLICADAS =================
  isDuplicateMessage(userId: string, text: string, windowMs: number): boolean {
    const now = Date.now();
    const last = this.lastMessages[userId];

    const normalizedText = text.trim().toLowerCase();

    if (last) {
      const isSame = last.text === normalizedText;
      const isFast = now - last.timestamp < windowMs;

      if (isSame && isFast) {
        return true; // 🚫 bloqueia
      }
    }

    // atualiza última mensagem
    this.lastMessages[userId] = {
      text: normalizedText,
      timestamp: now,
    };

    return false;
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

    return userId;
  }

  addAgent(agentId: string, socket: Socket) {
    this.agents[agentId] = socket;
  }

  removeAgent(agentId: string) {
    delete this.agents[agentId];
    delete this.lastMessages[agentId]; // 🚨 limpa cache de duplicadas
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
    delete this.lastMessages[userId]; // 🚨 limpa cache

    this.broadcastAgentsList();
  }

  // ================= LIST =================
  broadcastAgentsList() {
    if (this.broadcastAgentsListCallback) {
      this.broadcastAgentsListCallback();
    }
  }

  async buscarUsuarioPeloId(userId: string): Promise<Usuario | null> {
    return this.usuarioModel.findByPk(userId);
  }
}
