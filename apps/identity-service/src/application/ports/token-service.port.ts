export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  status: string;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshTokenHash: string;
  refreshExpiresAt: Date;
  familyId: string;
}

export abstract class TokenService {
  abstract issueTokens(payload: AccessTokenPayload): Promise<IssuedTokens>;

  abstract verifyAccessToken(token: string): Promise<AccessTokenPayload | null>;

  abstract hashOpaqueToken(rawToken: string): string;

  abstract generateOpaqueToken(): string;

  abstract parseTtlToSeconds(ttl: string): number;
}
