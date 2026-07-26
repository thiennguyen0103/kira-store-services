import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdentityAccount } from '../../../domain/entities/identity-account.entity';
import { IdentityRepository } from '../../../domain/repositories/identity.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { IdentityId } from '../../../domain/value-objects/identity-id.vo';
import { IdentityAccountOrmEntity } from '../entities/identity-account.orm-entity';
import { IdentityPersistenceMapper } from '../mappers/identity-persistence.mapper';

@Injectable()
export class TypeOrmIdentityRepository extends IdentityRepository {
  constructor(
    @InjectRepository(IdentityAccountOrmEntity)
    private readonly accounts: Repository<IdentityAccountOrmEntity>,
    private readonly mapper: IdentityPersistenceMapper,
  ) {
    super();
  }

  async findById(id: IdentityId): Promise<IdentityAccount | null> {
    const orm = await this.accounts.findOne({ where: { id: id.value } });
    return orm ? this.mapper.toAccountDomain(orm) : null;
  }

  async findByEmail(email: Email): Promise<IdentityAccount | null> {
    const orm = await this.accounts.findOne({
      where: { email: email.value },
    });
    return orm ? this.mapper.toAccountDomain(orm) : null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return this.accounts.existsBy({ email: email.value });
  }

  async save(account: IdentityAccount): Promise<void> {
    await this.accounts.save(this.mapper.toAccountOrm(account));
  }
}
