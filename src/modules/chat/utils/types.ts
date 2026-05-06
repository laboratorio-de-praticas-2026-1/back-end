import { Socket } from 'socket.io';
import { JwtUserPayload } from 'src/commons/auth.service';
import { NivelUsuarioEnum } from 'src/commons/constantes/nivel-usuario-enum';

export interface AuthSocket extends Socket {
  userData?: JwtUserPayload;
  role?: NivelUsuarioEnum;
  name?: string;
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
  authUserId: number;
  lastActivity: number;
  lastMessageAt?: number;
}

export type IncomingMessage = {
  type: 'message' | 'resync' | 'admin_resync';
  text?: string;
  to?: string;
};
