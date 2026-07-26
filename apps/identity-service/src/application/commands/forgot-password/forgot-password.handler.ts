import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { IdentityRepository } from '../../../domain/repositories/identity.repository';
import { VerificationTokenRepository } from '../../../domain/repositories/verification-token.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { EmailPort } from '../../ports/email.port';
import { TokenService } from '../../ports/token-service.port';
import { ForgotPasswordCommand } from './forgot-password.command';

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  constructor(
    private readonly identities: IdentityRepository,
    private readonly verificationTokens: VerificationTokenRepository,
    private readonly tokenService: TokenService,
    private readonly emailPort: EmailPort,
    private readonly config: ConfigService,
  ) {}

  async execute(
    command: ForgotPasswordCommand,
  ): Promise<{ success: boolean; message: string }> {
    const message =
      'If an account exists for that email, a reset link has been sent.';

    let email: Email;
    try {
      email = Email.create(command.email);
    } catch {
      return { success: true, message };
    }

    const account = await this.identities.findByEmail(email);
    if (!account) {
      return { success: true, message };
    }

    await this.verificationTokens.invalidatePasswordResetsForIdentity(
      account.id.value,
    );

    const rawToken = this.tokenService.generateOpaqueToken();
    const tokenHash = this.tokenService.hashOpaqueToken(rawToken);
    await this.verificationTokens.createPasswordReset({
      identityId: account.id.value,
      tokenHash,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    });

    const publicUrl = this.config.getOrThrow<string>('APP_PUBLIC_URL');
    const resetUrl = `${publicUrl}/auth/reset-password?token=${rawToken}`;

    await this.emailPort.sendPasswordReset({
      to: account.email.value,
      firstName: account.firstName,
      resetUrl,
    });

    return { success: true, message };
  }
}
