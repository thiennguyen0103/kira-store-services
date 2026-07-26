import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
import type {
  AuthTokensResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  IdentityServiceClient,
  LoginRequest,
  LogoutRequest,
  LogoutResponse,
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
import { IdentityClientPort } from '../../application/ports/identity-client.port';

@Injectable()
export class IdentityClient extends IdentityClientPort implements OnModuleInit {
  private identityService!: IdentityServiceClient;

  constructor(
    @Inject(SERVICE_TOKENS.IDENTITY_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.identityService = this.client.getService<IdentityServiceClient>(
      GRPC_SERVICE_NAMES.IDENTITY,
    );
  }

  ping(): Observable<PingResponse> {
    return this.identityService.ping({});
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.identityService.register(request);
  }

  login(request: LoginRequest): Observable<AuthTokensResponse> {
    return this.identityService.login(request);
  }

  refreshToken(request: RefreshTokenRequest): Observable<AuthTokensResponse> {
    return this.identityService.refreshToken(request);
  }

  logout(request: LogoutRequest): Observable<LogoutResponse> {
    return this.identityService.logout(request);
  }

  validateToken(
    request: ValidateTokenRequest,
  ): Observable<ValidateTokenResponse> {
    return this.identityService.validateToken(request);
  }

  verifyEmail(request: VerifyEmailRequest): Observable<AuthTokensResponse> {
    return this.identityService.verifyEmail(request);
  }

  forgotPassword(
    request: ForgotPasswordRequest,
  ): Observable<ForgotPasswordResponse> {
    return this.identityService.forgotPassword(request);
  }

  resetPassword(
    request: ResetPasswordRequest,
  ): Observable<ResetPasswordResponse> {
    return this.identityService.resetPassword(request);
  }
}
