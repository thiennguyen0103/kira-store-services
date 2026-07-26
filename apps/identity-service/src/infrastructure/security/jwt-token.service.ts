import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenPayload,
  IssuedTokens,
  TokenService,
} from '../../application/ports/token-service.port';

@Injectable()
export class JwtTokenService extends TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async issueTokens(payload: AccessTokenPayload): Promise<IssuedTokens> {
    const accessTtl = this.config.getOrThrow<string>('JWT_ACCESS_TTL');
    const refreshTtl = this.config.getOrThrow<string>('JWT_REFRESH_TTL');
    const expiresIn = this.parseTtlToSeconds(accessTtl);

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn,
    });

    const refreshToken = this.generateOpaqueToken();
    const refreshTokenHash = this.hashOpaqueToken(refreshToken);
    const refreshExpiresAt = new Date(
      Date.now() + this.parseTtlToSeconds(refreshTtl) * 1000,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
      refreshTokenHash,
      refreshExpiresAt,
      familyId: randomUUID(),
    };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      if (!payload?.sub || !payload.email) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  hashOpaqueToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  generateOpaqueToken(): string {
    return randomBytes(32).toString('base64url');
  }

  parseTtlToSeconds(ttl: string): number {
    const match = /^(\d+)([smhd])$/.exec(ttl.trim());
    if (!match) {
      return 900;
    }
    const amount = Number(match[1]);
    const unit = match[2];
    switch (unit) {
      case 's':
        return amount;
      case 'm':
        return amount * 60;
      case 'h':
        return amount * 3600;
      case 'd':
        return amount * 86400;
      default:
        return 900;
    }
  }
}
