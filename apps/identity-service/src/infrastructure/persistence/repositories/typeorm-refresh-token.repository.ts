import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { IdentityId } from '../../../domain/value-objects/identity-id.vo';
import { RefreshTokenId } from '../../../domain/value-objects/refresh-token-id.vo';
import { RefreshTokenOrmEntity } from '../entities/refresh-token.orm-entity';
import { IdentityPersistenceMapper } from '../mappers/identity-persistence.mapper';

@Injectable()
export class TypeOrmRefreshTokenRepository extends RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly tokens: Repository<RefreshTokenOrmEntity>,
    private readonly mapper: IdentityPersistenceMapper,
  ) {
    super();
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const orm = await this.tokens.findOne({ where: { tokenHash } });
    return orm ? this.mapper.toRefreshTokenDomain(orm) : null;
  }

  async findById(id: RefreshTokenId): Promise<RefreshToken | null> {
    const orm = await this.tokens.findOne({ where: { id: id.value } });
    return orm ? this.mapper.toRefreshTokenDomain(orm) : null;
  }

  async save(token: RefreshToken): Promise<void> {
    await this.tokens.save(this.mapper.toRefreshTokenOrm(token));
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.tokens.update(
      { familyId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async revokeAllForIdentity(identityId: IdentityId): Promise<void> {
    await this.tokens.update(
      { identityId: identityId.value, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }
}
