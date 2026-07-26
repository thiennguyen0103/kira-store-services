import type { Observable } from 'rxjs';
import type {
  AuthTokensResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
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

export abstract class IdentityClientPort {
  abstract ping(): Observable<PingResponse>;

  abstract register(request: RegisterRequest): Observable<RegisterResponse>;

  abstract login(request: LoginRequest): Observable<AuthTokensResponse>;

  abstract refreshToken(
    request: RefreshTokenRequest,
  ): Observable<AuthTokensResponse>;

  abstract logout(request: LogoutRequest): Observable<LogoutResponse>;

  abstract validateToken(
    request: ValidateTokenRequest,
  ): Observable<ValidateTokenResponse>;

  abstract verifyEmail(
    request: VerifyEmailRequest,
  ): Observable<AuthTokensResponse>;

  abstract forgotPassword(
    request: ForgotPasswordRequest,
  ): Observable<ForgotPasswordResponse>;

  abstract resetPassword(
    request: ResetPasswordRequest,
  ): Observable<ResetPasswordResponse>;
}
