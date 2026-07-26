import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import type {
  AuthTokensResponse,
  ForgotPasswordResponse,
  LogoutResponse,
  RegisterResponse,
  ResetPasswordResponse,
} from 'libs/shared/generated/identity';
import { IdentityClientPort } from '../application/ports/identity-client.port';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly identityClient: IdentityClientPort) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  register(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
  ): Promise<RegisterResponse> {
    return this.call(() =>
      firstValueFrom(
        this.identityClient.register({
          email: body.email,
          password: body.password,
          firstName: body.firstName,
          lastName: body.lastName,
        }),
      ),
    );
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Sign in with email and password' })
  login(
    @Body() body: { email: string; password: string },
  ): Promise<AuthTokensResponse> {
    return this.call(() =>
      firstValueFrom(
        this.identityClient.login({
          email: body.email,
          password: body.password,
        }),
      ),
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token' })
  refresh(@Body() body: { refreshToken: string }): Promise<AuthTokensResponse> {
    return this.call(() =>
      firstValueFrom(
        this.identityClient.refreshToken({
          refreshToken: body.refreshToken,
        }),
      ),
    );
  }

  @Post('logout')
  @ApiOperation({ summary: 'Revoke refresh token' })
  logout(@Body() body: { refreshToken: string }): Promise<LogoutResponse> {
    return this.call(() =>
      firstValueFrom(
        this.identityClient.logout({ refreshToken: body.refreshToken }),
      ),
    );
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email and issue tokens' })
  verifyEmail(@Query('token') token: string): Promise<AuthTokensResponse> {
    return this.call(() =>
      firstValueFrom(this.identityClient.verifyEmail({ token })),
    );
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Request password reset email' })
  forgotPassword(
    @Body() body: { email: string },
  ): Promise<ForgotPasswordResponse> {
    return this.call(() =>
      firstValueFrom(this.identityClient.forgotPassword({ email: body.email })),
    );
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(
    @Body() body: { token: string; newPassword: string },
  ): Promise<ResetPasswordResponse> {
    return this.call(() =>
      firstValueFrom(
        this.identityClient.resetPassword({
          token: body.token,
          newPassword: body.newPassword,
        }),
      ),
    );
  }

  private async call<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): HttpException {
    const grpcError = error as {
      code?: number;
      details?: string;
      message?: string;
    };
    const message =
      grpcError.details || grpcError.message || 'Authentication error';

    switch (grpcError.code) {
      case GrpcStatus.ALREADY_EXISTS:
        return new HttpException(message, HttpStatus.CONFLICT);
      case GrpcStatus.UNAUTHENTICATED:
        return new HttpException(message, HttpStatus.UNAUTHORIZED);
      case GrpcStatus.PERMISSION_DENIED:
        return new HttpException(message, HttpStatus.FORBIDDEN);
      case GrpcStatus.INVALID_ARGUMENT:
        return new HttpException(message, HttpStatus.BAD_REQUEST);
      case GrpcStatus.NOT_FOUND:
        return new HttpException(message, HttpStatus.NOT_FOUND);
      default:
        return new HttpException(message, HttpStatus.BAD_GATEWAY);
    }
  }
}
