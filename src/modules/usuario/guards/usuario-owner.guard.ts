import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

type NivelUsuario = 'cliente' | 'administrador';

interface UsuarioAutenticado {
  id: number;
  nivel: NivelUsuario;
}

interface RequestComUsuario {
  user?: UsuarioAutenticado;
  headers: {
    'x-user-id'?: string;
    'x-user-nivel'?: string;
  };
  params: {
    id: string;
  };
}

interface JwtPayload {
  id: number;
  nivel: NivelUsuario;
}
@Injectable()
export class UsuarioOwnerGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('Verificando permissão de acesso com UsuarioOwnerGuard');
    const request: Request = context.switchToHttp().getRequest<Request>();

    const headers = request.headers as Record<string, string | undefined>;
    const authHeader = headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extraído:', token);
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      console.log('Token verificado com sucesso:', payload);
      (request as Request & { user: JwtPayload }).user = payload;
    } catch {
      console.log('Falha na verificação do token');
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const usuario = (request as Request & { user: JwtPayload }).user;

    if (usuario.nivel === 'administrador' || usuario.nivel === 'cliente') return true;

    const idAlvo = Number(request.params.id);
    
    console.log(`Acesso negado: usuário ${usuario.id} tentou acessar dados do usuário ${idAlvo}`);
    throw new ForbiddenException(
      'Você não tem permissão para alterar os dados deste usuário.',
    );
  }

  private extrairUsuario(request: RequestComUsuario): UsuarioAutenticado {
    if (request.user) return request.user;

    // TODO: remover este fallback quando o JwtAuthGuard estiver implementado
    // Temporário para testes via Postman — headers: x-user-id, x-user-nivel
    return {
      id: Number(request.headers['x-user-id']),
      nivel: request.headers['x-user-nivel'] as NivelUsuario,
    };
  }

  private isUsuarioValido(usuario: UsuarioAutenticado): boolean {
    return (
      Number.isFinite(usuario.id) &&
      ['cliente', 'administrador'].includes(usuario.nivel)
    );
  }
}
