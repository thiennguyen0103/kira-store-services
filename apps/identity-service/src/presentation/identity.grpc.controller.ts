import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { GRPC_SERVICE_NAMES } from 'libs/shared/constants';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import type {
  AuthTokensResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LogoutRequest,
  LogoutResponse,
  PingRequest,
  PingResponse,
  RefreshTokenRequest,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  VerifyEmailRequest,
} from 'libs/shared/generated/identity';
import { ForgotPasswordCommand } from '../application/commands/forgot-password/forgot-password.command';
import { LoginCommand } from '../application/commands/login/login.command';
import { LogoutCommand } from '../application/commands/logout/logout.command';
import { RefreshTokenCommand } from '../application/commands/refresh-token/refresh-token.command';
import { RegisterCommand } from '../application/commands/register/register.command';
import { ResetPasswordCommand } from '../application/commands/reset-password/reset-password.command';
import { VerifyEmailCommand } from '../application/commands/verify-email/verify-email.command';
import type {
  AuthTokensResult,
  RegisterResult,
} from '../application/dto/auth-result.dto';
import { ValidateTokenQuery } from '../application/queries/validate-token/validate-token.query';
import type { ValidateTokenResult } from '../application/queries/validate-token/validate-token.handler';

@Controller()
export class IdentityGrpcController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod(GRPC_SERVICE_NAMES.IDENTITY, 'Ping')
  ping(_data: PingRequest): PingResponse {
    return { ok: true, service: 'identity-service' };
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.IDENTITY, 'Register')
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.execute(() =>
      this.commandBus.execute<RegisterCommand, RegisterResult>(
        new RegisterCommand(
          data.email,
          data.password,
          data.firstName,
          data.lastName,
        ),
      ),
    );
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.IDENTITY, 'Login')
  async login(data: LoginRequest): Promise<AuthTokensResponse> {
    return this.execute(() =>
      this.commandBus.execute<LoginCommand, AuthTokensResult>(
        new LoginCommand(data.email, data.password),
      ),
    );
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.IDENTITY, 'RefreshToken')
  async refreshToken(data: RefreshTokenRequest): Promise<AuthTokensResponse> {
    return this.execute(() =>
      this.commandBus.execute<RefreshTokenCommand, AuthTokensResult>(
        new RefreshTokenCommand(data.refreshToken),
      ),
    );
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.IDENTITY, 'Logout')
  async logout(data: LogoutRequest): Promise<LogoutResponse> {
    return this.execute(() =>
      this.commandBus.execute<LogoutCommand, LogoutResponse>(
        new LogoutCommand(data.refreshToken),
      ),
    );
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.IDENTITY, 'ValidateToken')
  async validateToken(
    data: ValidateTokenRequest,
  ): Promise<ValidateTokenResponse> {
    return this.execute(() =>
      this.queryBus.execute<ValidateTokenQuery, ValidateTokenResult>(
        new ValidateTokenQuery(data.accessToken),
      ),
    );
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.IDENTITY, 'VerifyEmail')
  async verifyEmail(data: VerifyEmailRequest): Promise<AuthTokensResponse> {
    return this.execute(() =>
      this.commandBus.execute<VerifyEmailCommand, AuthTokensResult>(
        new VerifyEmailCommand(data.token),
      ),
    );
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.IDENTITY, 'ForgotPassword')
  async forgotPassword(
    data: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    return this.execute(() =>
      this.commandBus.execute<ForgotPasswordCommand, ForgotPasswordResponse>(
        new ForgotPasswordCommand(data.email),
      ),
    );
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.IDENTITY, 'ResetPassword')
  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    return this.execute(() =>
      this.commandBus.execute<ResetPasswordCommand, ResetPasswordResponse>(
        new ResetPasswordCommand(data.token, data.newPassword),
      ),
    );
  }

  private async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw this.toRpcException(error);
    }
  }

  private toRpcException(error: unknown): RpcException {
    if (error instanceof DomainException) {
      return new RpcException({
        code: this.mapGrpcCode(error.code),
        message: error.message,
      });
    }

    if (error instanceof Error) {
      return new RpcException({
        code: GrpcStatus.INTERNAL,
        message: error.message,
      });
    }

    return new RpcException({
      code: GrpcStatus.INTERNAL,
      message: 'Internal error',
    });
  }

  private mapGrpcCode(code: string): GrpcStatus {
    switch (code) {
      case 'EMAIL_ALREADY_EXISTS':
        return GrpcStatus.ALREADY_EXISTS;
      case 'INVALID_CREDENTIALS':
      case 'INVALID_REFRESH_TOKEN':
      case 'REFRESH_TOKEN_REUSE':
      case 'REFRESH_TOKEN_EXPIRED':
        return GrpcStatus.UNAUTHENTICATED;
      case 'EMAIL_NOT_VERIFIED':
      case 'ACCOUNT_LOCKED':
      case 'ACCOUNT_DISABLED':
      case 'ACCOUNT_INACTIVE':
        return GrpcStatus.PERMISSION_DENIED;
      default:
        return GrpcStatus.INVALID_ARGUMENT;
    }
  }
}
