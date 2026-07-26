import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { IdentityRepository } from '../../../domain/repositories/identity.repository';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { VerificationTokenRepository } from '../../../domain/repositories/verification-token.repository';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { IdentityId } from '../../../domain/value-objects/identity-id.vo';
import { RefreshTokenId } from '../../../domain/value-objects/refresh-token-id.vo';
import { TokenService } from '../../ports/token-service.port';
import type { AuthTokensResult } from '../../dto/auth-result.dto';
import { VerifyEmailCommand } from './verify-email.command';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(
    private readonly identities: IdentityRepository,
    private readonly verificationTokens: VerificationTokenRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<AuthTokensResult> {
    const tokenHash = this.tokenService.hashOpaqueToken(command.token);
    const record =
      await this.verificationTokens.findValidEmailVerification(tokenHash);

    if (!record) {
      throw new DomainException('Invalid or expired verification token.', {
        code: 'INVALID_VERIFICATION_TOKEN',
      });
    }

    const account = await this.identities.findById(
      IdentityId.restore(record.identityId),
    );
    if (!account) {
      throw new DomainException('Invalid or expired verification token.', {
        code: 'INVALID_VERIFICATION_TOKEN',
      });
    }

    account.verifyEmail();
    await this.identities.save(account);
    await this.verificationTokens.consumeEmailVerification(record.id);
    await this.verificationTokens.invalidateEmailVerificationsForIdentity(
      account.id.value,
    );

    const issued = await this.tokenService.issueTokens({
      sub: account.id.value,
      email: account.email.value,
      role: account.role,
      status: account.status,
    });

    const refresh = RefreshToken.create({
      id: RefreshTokenId.create(),
      identityId: account.id,
      tokenHash: issued.refreshTokenHash,
      familyId: issued.familyId,
      expiresAt: issued.refreshExpiresAt,
    });
    await this.refreshTokens.save(refresh);

    return {
      identityId: account.id.value,
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
      tokenType: 'Bearer',
      expiresIn: issued.expiresIn,
    };
  }
}
