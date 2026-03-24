import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

// ================= TYPES =================
interface JwtUserPayload {
  id: number;
  nivel: number;
  nome?: string;
  email?: string;
}

interface ChatMessage {
  userId: string;
  fromUserId: string | number;
  nome: string;
  text: string;
  timestamp: string;
}

interface UserData {
  ws: WebSocket;
  nome: string;
  lastActivity: number;
  lastMessageAt?: number;
}

// ================= SERVICE =================
@Injectable()
export class ChatService {
  users: Record<string, UserData> = {};
  agents: Record<string, WebSocket> = {};
  history: Record<string, ChatMessage[]> = {};
  timeouts: Record<string, NodeJS.Timeout> = {};

  private JWT_SECRET = process.env.JWT_SECRET || 'secret';
  private INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 60 min

  // ================= TOKEN =================
  verifyToken(token?: string): JwtUserPayload | null {
    if (!token) return null;

    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);

      if (
        typeof decoded === 'object' &&
        'id' in decoded &&
        'nivel' in decoded
      ) {
        return decoded as JwtUserPayload;
      }

      return null;
    } catch {
      return null;
    }
  }

  // ================= SOCKET =================
  send(ws: WebSocket, data: unknown) {
    if (ws.readyState !== WebSocket.OPEN) return;

    try {
      ws.send(JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  }

  broadcastAgents(data: unknown, excludeAgentId?: string) {
    for (const [id, agent] of Object.entries(this.agents)) {
      if (excludeAgentId && id === excludeAgentId) continue;

      if (agent.readyState === WebSocket.OPEN) {
        this.send(agent, data);
      }
    }
  }

  // ================= USERS =================
  addUser(ws: WebSocket, nome: string) {
    const userId = this.getNextUserId();

    this.users[userId] = {
      ws,
      nome,
      lastActivity: Date.now(),
    };

    this.history[userId] = [];

    this.resetTimeout(userId);
    this.broadcastAgentsList();

    return userId;
  }

  addAgent(agentId: string, ws: WebSocket) {
    this.agents[agentId] = ws;
    this.broadcastAgentsList();
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

    this.broadcastAgents({
      type: 'userDisconnected',
      userId,
      nome: user.nome,
      reason,
    });

    if (user.ws.readyState === WebSocket.OPEN) {
      user.ws.close();
    }

    this.clearUserTimeout(userId);

    delete this.users[userId];
    delete this.history[userId];

    this.broadcastAgentsList();
  }

  // ================= LIST =================
  broadcastAgentsList() {
    const userList = Object.entries(this.users).map(([id, u]) => ({
      userId: id,
      nome: u.nome,
    }));

    this.broadcastAgents({
      type: 'users',
      users: userList,
    });

    this.broadcastAgents({
      type: 'agents',
      agents: Object.keys(this.agents),
    });
  }
}
