import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { IdentityAccount } from '../../../domain/entities/identity-account.entity';
import { IdentityRepository } from '../../../domain/repositories/identity.repository';
import { VerificationTokenRepository } from '../../../domain/repositories/verification-token.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { HashedPassword } from '../../../domain/value-objects/hashed-password.vo';
import { IdentityId } from '../../../domain/value-objects/identity-id.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import { EmailPort } from '../../ports/email.port';
import { PasswordHasher } from '../../ports/password-hasher.port';
import { TokenService } from '../../ports/token-service.port';
import type { RegisterResult } from '../../dto/auth-result.dto';
import { IdentityDomainEventDispatcher } from '../../services/identity-domain-event.dispatcher';
import { RegisterCommand } from './register.command';

const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly identities: IdentityRepository,
    private readonly verificationTokens: VerificationTokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly emailPort: EmailPort,
    private readonly domainEvents: IdentityDomainEventDispatcher,
    private readonly config: ConfigService,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResult> {
    const email = Email.create(command.email);
    const password = Password.create(command.password);

    if (await this.identities.existsByEmail(email)) {
      throw new DomainException('An account with this email already exists.', {
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }

    const passwordHash = HashedPassword.create(
      await this.passwordHasher.hash(password.value),
    );

    const account = IdentityAccount.register({
      id: IdentityId.create(),
      email,
      passwordHash,
      firstName: command.firstName,
      lastName: command.lastName,
    });

    await this.identities.save(account);
    await this.domainEvents.dispatch(account);

    const rawVerifyToken = this.tokenService.generateOpaqueToken();
    const tokenHash = this.tokenService.hashOpaqueToken(rawVerifyToken);
    await this.verificationTokens.createEmailVerification({
      identityId: account.id.value,
      tokenHash,
      expiresAt: new Date(Date.now() + EMAIL_VERIFY_TTL_MS),
    });

    const publicUrl = this.config.getOrThrow<string>('APP_PUBLIC_URL');
    const verifyUrl = `${publicUrl}/auth/verify-email?token=${rawVerifyToken}`;

    await this.emailPort.sendEmailVerification({
      to: account.email.value,
      firstName: account.firstName,
      verifyUrl,
    });

    return {
      identityId: account.id.value,
      email: account.email.value,
      status: account.status,
      message: 'Registration successful. Please verify your email to sign in.',
    };
  }
}
