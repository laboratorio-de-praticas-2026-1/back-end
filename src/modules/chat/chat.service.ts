import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import * as jwt from 'jsonwebtoken';

interface JwtUserPayload {
  id: number;
  nivel: number;
  nome?: string;
  email?: string;
}

interface ChatMessage {
  userId: number;
  fromUserId: number;
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

@Injectable()
export class ChatService {
  users: Record<number, UserData> = {};
  agents: Record<number, WebSocket> = {};
  history: Record<number, ChatMessage[]> = {};

  private JWT_SECRET = process.env.JWT_SECRET || 'secret';

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

  send(ws: WebSocket, data: unknown) {
    if (ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  }

  broadcastAgents(data: unknown) {
    for (const agent of Object.values(this.agents)) {
      if (agent.readyState === WebSocket.OPEN) {
        this.send(agent, data);
      }
    }
  }

  addUser(userId: number, ws: WebSocket, nome: string) {
    this.users[userId] = {
      ws,
      nome,
      lastActivity: Date.now(),
    };

    if (!this.history[userId]) {
      this.history[userId] = [];
    }
  }

  addAgent(agentId: number, ws: WebSocket) {
    this.agents[agentId] = ws;
  }

  updateUserActivity(userId: number) {
    if (this.users[userId]) {
      this.users[userId].lastActivity = Date.now();
    }
  }

  addMessageToHistory(userId: number, msg: ChatMessage) {
    if (!this.history[userId]) {
      this.history[userId] = [];
    }

    this.history[userId].push(msg);

    if (this.history[userId].length > 100) {
      this.history[userId].shift();
    }
  }

  endUserSession(userId: number, reason: string) {
    delete this.users[userId];
    delete this.history[userId];

    this.broadcastAgents({
      type: 'status',
      msg: `Usuário ${userId} saiu do chat (${reason})`,
    });
  }
}
