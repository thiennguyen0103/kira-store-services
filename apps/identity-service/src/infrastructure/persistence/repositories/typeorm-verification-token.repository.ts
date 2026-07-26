import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { VerificationTokenRepository } from '../../../domain/repositories/verification-token.repository';
import { EmailVerificationTokenOrmEntity } from '../entities/email-verification-token.orm-entity';
import { PasswordResetTokenOrmEntity } from '../entities/password-reset-token.orm-entity';

@Injectable()
export class TypeOrmVerificationTokenRepository extends VerificationTokenRepository {
  constructor(
    @InjectRepository(EmailVerificationTokenOrmEntity)
    private readonly emailTokens: Repository<EmailVerificationTokenOrmEntity>,
    @InjectRepository(PasswordResetTokenOrmEntity)
    private readonly resetTokens: Repository<PasswordResetTokenOrmEntity>,
  ) {
    super();
  }

  async createEmailVerification(params: {
    identityId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.emailTokens.save(
      this.emailTokens.create({
        identityId: params.identityId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
        consumedAt: null,
      }),
    );
  }

  async findValidEmailVerification(
    tokenHash: string,
  ): Promise<{ identityId: string; id: string } | null> {
    const orm = await this.emailTokens.findOne({
      where: {
        tokenHash,
        consumedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
    return orm ? { id: orm.id, identityId: orm.identityId } : null;
  }

  async consumeEmailVerification(id: string): Promise<void> {
    await this.emailTokens.update({ id }, { consumedAt: new Date() });
  }

  async createPasswordReset(params: {
    identityId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.resetTokens.save(
      this.resetTokens.create({
        identityId: params.identityId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
        consumedAt: null,
      }),
    );
  }

  async findValidPasswordReset(
    tokenHash: string,
  ): Promise<{ identityId: string; id: string } | null> {
    const orm = await this.resetTokens.findOne({
      where: {
        tokenHash,
        consumedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
    return orm ? { id: orm.id, identityId: orm.identityId } : null;
  }

  async consumePasswordReset(id: string): Promise<void> {
    await this.resetTokens.update({ id }, { consumedAt: new Date() });
  }

  async invalidateEmailVerificationsForIdentity(
    identityId: string,
  ): Promise<void> {
    await this.emailTokens.update(
      { identityId, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );
  }

  async invalidatePasswordResetsForIdentity(identityId: string): Promise<void> {
    await this.resetTokens.update(
      { identityId, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );
  }
}
