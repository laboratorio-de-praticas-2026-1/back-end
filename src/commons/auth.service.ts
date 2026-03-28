import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface JwtUserPayload {
  id: number;
  nivel: number;
  nome?: string;
  email?: string;
}

@Injectable()
export class AuthService {
  private JWT_SECRET = process.env.JWT_SECRET || 'secret';

  verifyToken(token?: string): JwtUserPayload | null {
    if (!token) return null;

    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JwtUserPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}
