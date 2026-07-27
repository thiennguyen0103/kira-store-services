import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { IdentityClientPort } from '../../application/ports/identity-client.port';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

export type AuthenticatedUser = {
  identityId: string;
  email: string;
  role: string;
  status: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly identityClient: IdentityClientPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: AuthenticatedUser;
    }>();
    const accessToken = this.extractBearerToken(request.headers.authorization);
    if (!accessToken) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const result = await firstValueFrom(
      this.identityClient.validateToken({ accessToken }),
    );

    if (!result.valid) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    request.user = {
      identityId: result.identityId,
      email: result.email,
      role: result.role,
      status: result.status,
    };

    return true;
  }

  private extractBearerToken(authorization?: string): string | null {
    if (!authorization) {
      return null;
    }
    const [scheme, token] = authorization.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return null;
    }
    return token;
  }
}
