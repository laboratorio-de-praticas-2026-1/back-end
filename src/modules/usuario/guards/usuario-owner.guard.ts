import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from './jwt-auth.guard';

@Injectable()
export class UsuarioOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload; params: { id: string } }>();

    if (!request.user) {
      throw new UnauthorizedException('Usuário não autenticado para esta operação.');
    }

    if (request.user.nivel === 'administrador') return true;

    if (request.user.id === Number(request.params.id)) return true;

    throw new ForbiddenException(
      'Você não tem permissão para alterar os dados deste usuário.',
    );
  }
}
