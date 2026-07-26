import { AggregateRoot } from 'libs/shared/domain/aggregate-root';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { UserRole } from 'libs/shared/enums';
import { AccountStatus } from '../enums/account-status.enum';
import { AccountLockedEvent } from '../events/account-locked.event';
import { EmailVerifiedEvent } from '../events/email-verified.event';
import { IdentityRegisteredEvent } from '../events/identity-registered.event';
import { PasswordChangedEvent } from '../events/password-changed.event';
import { Email } from '../value-objects/email.vo';
import { HashedPassword } from '../value-objects/hashed-password.vo';
import { IdentityId } from '../value-objects/identity-id.vo';

export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export interface IdentityAccountProps {
  email: Email;
  passwordHash: HashedPassword;
  role: UserRole;
  status: AccountStatus;
  failedLoginCount: number;
  lockedUntil: Date | null;
  emailVerifiedAt: Date | null;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class IdentityAccount extends AggregateRoot<IdentityId> {
  private constructor(
    id: IdentityId,
    private props: IdentityAccountProps,
  ) {
    super(id);
  }

  public static register(params: {
    id: IdentityId;
    email: Email;
    passwordHash: HashedPassword;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): IdentityAccount {
    const now = new Date();
    const firstName = params.firstName.trim();
    const lastName = params.lastName.trim();

    if (!firstName || !lastName) {
      throw new DomainException('First name and last name are required.', {
        code: 'INVALID_NAME',
      });
    }

    const account = new IdentityAccount(params.id, {
      email: params.email,
      passwordHash: params.passwordHash,
      role: params.role ?? UserRole.CUSTOMER,
      status: AccountStatus.PENDING_VERIFICATION,
      failedLoginCount: 0,
      lockedUntil: null,
      emailVerifiedAt: null,
      firstName,
      lastName,
      createdAt: now,
      updatedAt: now,
    });

    account.addDomainEvent(
      new IdentityRegisteredEvent(params.id, params.email, firstName, lastName),
    );

    return account;
  }

  public static restore(
    id: IdentityId,
    props: IdentityAccountProps,
  ): IdentityAccount {
    return new IdentityAccount(id, props);
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): HashedPassword {
    return this.props.passwordHash;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get status(): AccountStatus {
    return this.props.status;
  }

  get failedLoginCount(): number {
    return this.props.failedLoginCount;
  }

  get lockedUntil(): Date | null {
    return this.props.lockedUntil;
  }

  get emailVerifiedAt(): Date | null {
    return this.props.emailVerifiedAt;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public assertCanAuthenticate(): void {
    this.clearExpiredLock();

    if (this.props.status === AccountStatus.DISABLED) {
      throw new DomainException('Account is disabled.', {
        code: 'ACCOUNT_DISABLED',
      });
    }

    if (
      this.props.status === AccountStatus.LOCKED ||
      (this.props.lockedUntil && this.props.lockedUntil.getTime() > Date.now())
    ) {
      throw new DomainException('Account is temporarily locked.', {
        code: 'ACCOUNT_LOCKED',
        details: { lockedUntil: this.props.lockedUntil?.toISOString() },
      });
    }

    if (this.props.status === AccountStatus.PENDING_VERIFICATION) {
      throw new DomainException('Email address has not been verified.', {
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    if (this.props.status !== AccountStatus.ACTIVE) {
      throw new DomainException('Account cannot sign in.', {
        code: 'ACCOUNT_INACTIVE',
      });
    }
  }

  public recordFailedLogin(): void {
    this.clearExpiredLock();
    this.props.failedLoginCount += 1;
    this.touch();

    if (this.props.failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS) {
      this.props.status = AccountStatus.LOCKED;
      this.props.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      this.addDomainEvent(
        new AccountLockedEvent(this.id, this.props.lockedUntil),
      );
    }
  }

  public resetFailedLogins(): void {
    this.props.failedLoginCount = 0;
    this.props.lockedUntil = null;
    if (this.props.status === AccountStatus.LOCKED) {
      this.props.status = this.props.emailVerifiedAt
        ? AccountStatus.ACTIVE
        : AccountStatus.PENDING_VERIFICATION;
    }
    this.touch();
  }

  public verifyEmail(): void {
    if (this.props.status === AccountStatus.DISABLED) {
      throw new DomainException('Account is disabled.', {
        code: 'ACCOUNT_DISABLED',
      });
    }

    if (this.props.emailVerifiedAt) {
      return;
    }

    this.props.emailVerifiedAt = new Date();
    this.props.status = AccountStatus.ACTIVE;
    this.props.failedLoginCount = 0;
    this.props.lockedUntil = null;
    this.touch();
    this.addDomainEvent(new EmailVerifiedEvent(this.id));
  }

  public changePassword(passwordHash: HashedPassword): void {
    this.props.passwordHash = passwordHash;
    this.props.failedLoginCount = 0;
    this.props.lockedUntil = null;
    if (
      this.props.status === AccountStatus.LOCKED &&
      this.props.emailVerifiedAt
    ) {
      this.props.status = AccountStatus.ACTIVE;
    }
    this.touch();
    this.addDomainEvent(new PasswordChangedEvent(this.id));
  }

  private clearExpiredLock(): void {
    if (
      this.props.status === AccountStatus.LOCKED &&
      this.props.lockedUntil &&
      this.props.lockedUntil.getTime() <= Date.now()
    ) {
      this.props.lockedUntil = null;
      this.props.failedLoginCount = 0;
      this.props.status = this.props.emailVerifiedAt
        ? AccountStatus.ACTIVE
        : AccountStatus.PENDING_VERIFICATION;
      this.touch();
    }
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
