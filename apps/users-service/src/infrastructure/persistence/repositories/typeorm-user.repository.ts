import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'apps/users-service/src/domain/entities/address.entity';
import { User } from 'apps/users-service/src/domain/entities/user.entity';
import { UserRepository } from 'apps/users-service/src/domain/repositories/user.repository';
import { IdentityId } from 'apps/users-service/src/domain/value-objects/user/identity-id.vo';
import { UserId } from 'apps/users-service/src/domain/value-objects/user/user-id.vo';
import { DataSource, Repository } from 'typeorm';
import { AddressOrmEntity } from '../entities/address.entity';
import { UserOrmEntity } from '../entities/user.entity';
import { UserPersistenceMapper } from '../mappers/user-persistence.mapper';

@Injectable()
export class TypeOrmUserRepository extends UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
    @InjectRepository(AddressOrmEntity)
    private readonly addresses: Repository<AddressOrmEntity>,
    private readonly mapper: UserPersistenceMapper,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.users.findOne({
      where: { id: id.value },
      relations: { addresses: true },
    });

    if (!user) {
      return null;
    }

    return this.mapper.toDomain(user);
  }

  async findByIdentityId(identityId: IdentityId): Promise<User | null> {
    const user = await this.users.findOne({
      where: { identityId: identityId.value },
      relations: { addresses: true },
    });

    if (!user) {
      return null;
    }

    return this.mapper.toDomain(user);
  }

  async exists(id: UserId): Promise<boolean> {
    return this.users.existsBy({ id: id.value });
  }

  async updateAddress(userId: UserId, address: Address): Promise<void> {
    await this.addresses.save(this.mapper.toAddressOrm(address, userId.value));
  }

  async save(user: User): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const users = manager.getRepository(UserOrmEntity);
      const addresses = manager.getRepository(AddressOrmEntity);

      const existing = await users.findOne({
        where: { id: user.id.value },
        relations: { addresses: true },
      });

      await users.save(this.mapper.toUserOrm(user));

      const nextAddressIds = new Set(
        user.addresses.map((address) => address.id.value),
      );
      const orphaned = (existing?.addresses ?? []).filter(
        (address) => !nextAddressIds.has(address.id),
      );

      if (orphaned.length > 0) {
        await addresses.remove(orphaned);
      }

      if (user.addresses.length > 0) {
        await addresses.save(
          user.addresses.map((address) =>
            this.mapper.toAddressOrm(address, user.id.value),
          ),
        );
      }
    });
  }

  async delete(user: User): Promise<void> {
    // Address rows are removed by FK ON DELETE CASCADE.
    await this.users.delete({ id: user.id.value });
  }
}
