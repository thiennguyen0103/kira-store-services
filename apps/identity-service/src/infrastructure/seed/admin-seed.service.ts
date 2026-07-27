import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'libs/shared/enums';
import { PasswordHasher } from '../../application/ports/password-hasher.port';
import { IdentityDomainEventDispatcher } from '../../application/services/identity-domain-event.dispatcher';
import { IdentityAccount } from '../../domain/entities/identity-account.entity';
import { IdentityRepository } from '../../domain/repositories/identity.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { HashedPassword } from '../../domain/value-objects/hashed-password.vo';
import { IdentityId } from '../../domain/value-objects/identity-id.vo';
import { Password } from '../../domain/value-objects/password.vo';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly identities: IdentityRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly domainEvents: IdentityDomainEventDispatcher,
  ) {}

  async onModuleInit(): Promise<void> {
    const emailRaw = this.config.get<string>('SEED_ADMIN_EMAIL')?.trim();
    const passwordRaw = this.config.get<string>('SEED_ADMIN_PASSWORD');

    if (!emailRaw || !passwordRaw) {
      this.logger.debug(
        'Admin seed skipped (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set)',
      );
      return;
    }

    const email = Email.create(emailRaw);
    const existing = await this.identities.findByEmail(email);
    if (existing) {
      this.logger.log(
        `Admin seed skipped — account already exists for ${email.value}`,
      );
      return;
    }

    const password = Password.create(passwordRaw);
    const passwordHash = HashedPassword.create(
      await this.passwordHasher.hash(password.value),
    );

    const firstName =
      this.config.get<string>('SEED_ADMIN_FIRST_NAME')?.trim() || 'Admin';
    const lastName =
      this.config.get<string>('SEED_ADMIN_LAST_NAME')?.trim() || 'User';

    const account = IdentityAccount.register({
      id: IdentityId.create(),
      email,
      passwordHash,
      firstName,
      lastName,
      role: UserRole.ADMIN,
    });
    account.verifyEmail();

    await this.identities.save(account);
    await this.domainEvents.dispatch(account);

    this.logger.log(
      `Seeded ACTIVE admin account ${email.value} (id=${account.id.value})`,
    );
  }
}
