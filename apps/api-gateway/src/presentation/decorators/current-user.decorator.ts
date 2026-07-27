import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../guards/auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
    }>();
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }
    return request.user;
  },
);
