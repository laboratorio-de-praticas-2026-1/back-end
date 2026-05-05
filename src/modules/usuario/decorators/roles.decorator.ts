import { SetMetadata } from '@nestjs/common';
import { NivelUsuario } from '../guards/jwt-auth.guard';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: NivelUsuario[]) =>
  SetMetadata(ROLES_KEY, roles);
