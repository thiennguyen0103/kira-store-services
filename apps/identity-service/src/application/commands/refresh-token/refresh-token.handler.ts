import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { IdentityRepository } from '../../../domain/repositories/identity.repository';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { RefreshTokenId } from '../../../domain/value-objects/refresh-token-id.vo';
import { TokenService } from '../../ports/token-service.port';
import type { AuthTokensResult } from '../../dto/auth-result.dto';
import { RefreshTokenCommand } from './refresh-token.command';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly identities: IdentityRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthTokensResult> {
    const tokenHash = this.tokenService.hashOpaqueToken(command.refreshToken);
    const existing = await this.refreshTokens.findByTokenHash(tokenHash);

    if (!existing) {
      throw new DomainException('Invalid refresh token.', {
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    if (existing.isRevoked) {
      await this.refreshTokens.revokeFamily(existing.familyId);
      throw new DomainException('Refresh token reuse detected.', {
        code: 'REFRESH_TOKEN_REUSE',
      });
    }

    if (existing.isExpired) {
      existing.revoke();
      await this.refreshTokens.save(existing);
      throw new DomainException('Refresh token has expired.', {
        code: 'REFRESH_TOKEN_EXPIRED',
      });
    }

    const account = await this.identities.findById(existing.identityId);
    if (!account) {
      throw new DomainException('Invalid refresh token.', {
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    account.assertCanAuthenticate();

    const newId = RefreshTokenId.create();
    const issued = await this.tokenService.issueTokens({
      sub: account.id.value,
      email: account.email.value,
      role: account.role,
      status: account.status,
    });

    existing.revoke(newId);
    await this.refreshTokens.save(existing);

    const next = RefreshToken.create({
      id: newId,
      identityId: account.id,
      tokenHash: issued.refreshTokenHash,
      familyId: existing.familyId,
      expiresAt: issued.refreshExpiresAt,
    });
    await this.refreshTokens.save(next);

    return {
      identityId: account.id.value,
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
      tokenType: 'Bearer',
      expiresIn: issued.expiresIn,
    };
  }
}
