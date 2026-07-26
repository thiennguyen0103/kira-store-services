import { Injectable } from '@nestjs/common';
import { UserRole } from 'libs/shared/enums';
import { AccountStatus } from '../../../domain/enums/account-status.enum';
import { IdentityAccount } from '../../../domain/entities/identity-account.entity';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { HashedPassword } from '../../../domain/value-objects/hashed-password.vo';
import { IdentityId } from '../../../domain/value-objects/identity-id.vo';
import { RefreshTokenId } from '../../../domain/value-objects/refresh-token-id.vo';
import { IdentityAccountOrmEntity } from '../entities/identity-account.orm-entity';
import { RefreshTokenOrmEntity } from '../entities/refresh-token.orm-entity';

@Injectable()
export class IdentityPersistenceMapper {
  toAccountDomain(orm: IdentityAccountOrmEntity): IdentityAccount {
    return IdentityAccount.restore(IdentityId.restore(orm.id), {
      email: Email.restore(orm.email),
      passwordHash: HashedPassword.restore(orm.passwordHash),
      role: orm.role as UserRole,
      status: orm.status as AccountStatus,
      failedLoginCount: orm.failedLoginCount,
      lockedUntil: orm.lockedUntil,
      emailVerifiedAt: orm.emailVerifiedAt,
      firstName: orm.firstName,
      lastName: orm.lastName,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  toAccountOrm(account: IdentityAccount): IdentityAccountOrmEntity {
    const orm = new IdentityAccountOrmEntity();
    orm.id = account.id.value;
    orm.email = account.email.value;
    orm.passwordHash = account.passwordHash.value;
    orm.role = account.role;
    orm.status = account.status;
    orm.failedLoginCount = account.failedLoginCount;
    orm.lockedUntil = account.lockedUntil;
    orm.emailVerifiedAt = account.emailVerifiedAt;
    orm.firstName = account.firstName;
    orm.lastName = account.lastName;
    orm.createdAt = account.createdAt;
    orm.updatedAt = account.updatedAt;
    return orm;
  }

  toRefreshTokenDomain(orm: RefreshTokenOrmEntity): RefreshToken {
    return RefreshToken.restore(RefreshTokenId.restore(orm.id), {
      identityId: IdentityId.restore(orm.identityId),
      tokenHash: orm.tokenHash,
      familyId: orm.familyId,
      expiresAt: orm.expiresAt,
      revokedAt: orm.revokedAt,
      replacedByTokenId: orm.replacedByTokenId
        ? RefreshTokenId.restore(orm.replacedByTokenId)
        : null,
      createdAt: orm.createdAt,
    });
  }

  toRefreshTokenOrm(token: RefreshToken): RefreshTokenOrmEntity {
    const orm = new RefreshTokenOrmEntity();
    orm.id = token.id.value;
    orm.identityId = token.identityId.value;
    orm.tokenHash = token.tokenHash;
    orm.familyId = token.familyId;
    orm.expiresAt = token.expiresAt;
    orm.revokedAt = token.revokedAt;
    orm.replacedByTokenId = token.replacedByTokenId?.value ?? null;
    orm.createdAt = token.createdAt;
    return orm;
  }
}
