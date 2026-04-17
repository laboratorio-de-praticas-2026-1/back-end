import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

interface UsuarioAutenticado {
  id: number;
  nivel: 'cliente' | 'administrador';
}

interface RequestComUsuario {
  user?: UsuarioAutenticado;
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestComUsuario>();

    const user = request.user;

    if (!user || user.nivel !== 'administrador') {
      throw new ForbiddenException('Acesso negado');
    }

    return true;
  }
}
