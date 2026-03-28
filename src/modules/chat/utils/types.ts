import { Socket } from 'socket.io';
import { JwtUserPayload } from '../../commons/auth.service';

export enum UserRole {
  AGENT = 'agent',
  USER = 'user',
}

export interface AuthSocket extends Socket {
  userData?: JwtUserPayload;
  role?: UserRole;
  userId?: string;
}

export interface ChatMessage {
  userId: string;
  fromUserId: string | number;
  nome: string;
  text: string;
  timestamp: string;
}

export interface UserData {
  socket: Socket;
  nome: string;
  lastActivity: number;
  lastMessageAt?: number;
}

export interface IncomingMessage {
  type: 'connect' | 'message';
  token?: string;
  nome?: string;
  text?: string;
  to?: string;
}
