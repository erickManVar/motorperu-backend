import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { FastifyRequest } from 'fastify';

interface UserWithRole {
  role: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: UserWithRole }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Acceso denegado');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`Requiere rol: ${requiredRoles.join(' o ')}`);
    }

    return true;
  }
}
