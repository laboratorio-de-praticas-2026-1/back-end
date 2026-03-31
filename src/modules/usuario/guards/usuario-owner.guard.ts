import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
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
  params: {
    id: string;
  };
}

@Injectable()
export class UsuarioOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestComUsuario>();

    const usuario = this.extrairUsuario(request);

    if (!this.isUsuarioValido(usuario)) {
      throw new UnauthorizedException(
        'Usuário não autenticado para esta operação.',
      );
    }

    if (usuario.nivel === 'administrador') return true;

    const idAlvo = Number(request.params.id);

    if (usuario.id === idAlvo) return true;

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
