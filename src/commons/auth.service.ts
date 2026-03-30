import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { logger } from 'sequelize/lib/utils/logger';

export interface JwtUserPayload {
  id: number;
  nivel: string;
  nome?: string;
  email?: string;
}

@Injectable()
export class AuthService {
  private JWT_SECRET = process.env.JWT_SECRET || 'secret';

  private readonly logger = new Logger(AuthService.name);

  verifyToken(token?: string): JwtUserPayload | null {
    this.logger.log('Verificando token:', token);

    if (!token) return null;

    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JwtUserPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}
