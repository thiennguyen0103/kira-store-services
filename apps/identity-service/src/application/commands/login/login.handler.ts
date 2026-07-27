import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { IdentityRepository } from '../../../domain/repositories/identity.repository';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { RefreshTokenId } from '../../../domain/value-objects/refresh-token-id.vo';
import { PasswordHasher } from '../../ports/password-hasher.port';
import { TokenService } from '../../ports/token-service.port';
import type { AuthTokensResult } from '../../dto/auth-result.dto';
import { IdentityDomainEventDispatcher } from '../../services/identity-domain-event.dispatcher';
import { LoginCommand } from './login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly identities: IdentityRepository,
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly domainEvents: IdentityDomainEventDispatcher,
  ) {}

  async execute(command: LoginCommand): Promise<AuthTokensResult> {
    let email: Email;
    try {
      email = Email.create(command.email);
    } catch {
      throw new DomainException('Invalid email or password.', {
        code: 'INVALID_CREDENTIALS',
      });
    }

    const account = await this.identities.findByEmail(email);
    if (!account) {
      throw new DomainException('Invalid email or password.', {
        code: 'INVALID_CREDENTIALS',
      });
    }

    const passwordOk = await this.passwordHasher.verify(
      account.passwordHash.value,
      command.password,
    );

    if (!passwordOk) {
      account.recordFailedLogin();
      await this.identities.save(account);
      await this.domainEvents.dispatch(account);
      throw new DomainException('Invalid email or password.', {
        code: 'INVALID_CREDENTIALS',
      });
    }

    try {
      account.assertCanAuthenticate();
    } catch (error) {
      await this.identities.save(account);
      await this.domainEvents.dispatch(account);
      throw error;
    }

    account.resetFailedLogins();
    await this.identities.save(account);
    await this.domainEvents.dispatch(account);

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
