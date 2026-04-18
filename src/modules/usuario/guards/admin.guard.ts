import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

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
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestComUsuario>();

    const user = request.user ?? {
      id: Number(request.headers['x-user-id']),
      nivel: request.headers['x-user-nivel'] as NivelUsuario,
    };

    if (!user || user.nivel !== 'administrador') {
      throw new ForbiddenException('Acesso negado');
    }

    return true;
  }
}
