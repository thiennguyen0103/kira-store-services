import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { IdentityRepository } from '../../../domain/repositories/identity.repository';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { VerificationTokenRepository } from '../../../domain/repositories/verification-token.repository';
import { HashedPassword } from '../../../domain/value-objects/hashed-password.vo';
import { IdentityId } from '../../../domain/value-objects/identity-id.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import { PasswordHasher } from '../../ports/password-hasher.port';
import { TokenService } from '../../ports/token-service.port';
import { IdentityDomainEventDispatcher } from '../../services/identity-domain-event.dispatcher';
import { ResetPasswordCommand } from './reset-password.command';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    private readonly identities: IdentityRepository,
    private readonly verificationTokens: VerificationTokenRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly domainEvents: IdentityDomainEventDispatcher,
  ) {}

  async execute(
    command: ResetPasswordCommand,
  ): Promise<{ success: boolean; message: string }> {
    const password = Password.create(command.newPassword);
    const tokenHash = this.tokenService.hashOpaqueToken(command.token);
    const record =
      await this.verificationTokens.findValidPasswordReset(tokenHash);

    if (!record) {
      throw new DomainException('Invalid or expired reset token.', {
        code: 'INVALID_RESET_TOKEN',
      });
    }

    const account = await this.identities.findById(
      IdentityId.restore(record.identityId),
    );
    if (!account) {
      throw new DomainException('Invalid or expired reset token.', {
        code: 'INVALID_RESET_TOKEN',
      });
    }

    const hash = HashedPassword.create(
      await this.passwordHasher.hash(password.value),
    );
    account.changePassword(hash);
    await this.identities.save(account);
    await this.domainEvents.dispatch(account);
    await this.verificationTokens.consumePasswordReset(record.id);
    await this.verificationTokens.invalidatePasswordResetsForIdentity(
      account.id.value,
    );
    await this.refreshTokens.revokeAllForIdentity(account.id);

    return {
      success: true,
      message:
        'Password has been reset. Please sign in with your new password.',
    };
  }
}
