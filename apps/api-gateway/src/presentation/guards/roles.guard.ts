import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'libs/shared/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedUser } from './auth.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
    }>();
    const userRole = request.user?.role;
    if (!userRole || !requiredRoles.includes(userRole as UserRole)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
