import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressDto } from 'apps/users-service/src/application/dto/address.dto';
import { SearchUsersDto } from 'apps/users-service/src/application/dto/search-users.dto';
import { UserDetailDto } from 'apps/users-service/src/application/dto/user-detail.dto';
import { UserListItemDto } from 'apps/users-service/src/application/dto/user-list-item.dto';
import { UserProfileDto } from 'apps/users-service/src/application/dto/user-profile.dto';
import { UserQueryRepository } from 'apps/users-service/src/application/queries/repositories/user-query.repository';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { Repository } from 'typeorm';
import { validate as isUuid } from 'uuid';
import { UserOrmEntity } from '../entities/user.entity';
import { UserPersistenceMapper } from '../mappers/user-persistence.mapper';

@Injectable()
export class TypeOrmUserQueryRepository extends UserQueryRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
    private readonly mapper: UserPersistenceMapper,
  ) {
    super();
  }

  async findById(id: string): Promise<UserDetailDto | null> {
    if (!isUuid(id)) {
      return null;
    }

    const user = await this.users.findOne({
      where: { id },
      relations: { addresses: true },
    });

    if (!user) {
      return null;
    }

    return this.mapper.toDetailDto(user);
  }

  async findProfile(id: string): Promise<UserProfileDto | null> {
    if (!isUuid(id)) {
      return null;
    }

    const user = await this.users.findOne({ where: { id } });

    if (!user) {
      return null;
    }

    return new UserProfileDto(
      user.fullName,
      user.avatarUrl,
      user.phoneNumber,
      user.gender,
      user.birthday ? new Date(user.birthday) : null,
    );
  }

  async findByIdentityId(identityId: string): Promise<UserDetailDto | null> {
    if (!isUuid(identityId)) {
      return null;
    }

    const user = await this.users.findOne({ where: { identityId } });

    if (!user) {
      return null;
    }

    return this.mapper.toDetailDto(user);
  }

  async findAddresses(id: string): Promise<AddressDto[]> {
    if (!isUuid(id)) {
      return [];
    }

    const user = await this.users.findOne({
      where: { id },
      relations: { addresses: true },
    });

    if (!user) {
      return [];
    }

    return (user.addresses ?? []).map((address) =>
      this.mapper.toAddressDto(address),
    );
  }

  async findDefaultAddress(id: string): Promise<AddressDto | null> {
    if (!isUuid(id)) {
      return null;
    }

    const user = await this.users.findOne({
      where: { id },
      relations: { addresses: true },
    });

    if (!user) {
      return null;
    }

    const defaultAddress = user.addresses.find((address) => address.isDefault);

    if (!defaultAddress) {
      return null;
    }

    return this.mapper.toAddressDto(defaultAddress);
  }

  async search(
    filter: SearchUsersDto,
  ): Promise<PagedResultDto<UserListItemDto>> {
    const queryBuilder = this.users.createQueryBuilder('user');

    if (filter?.keyword?.trim()) {
      queryBuilder.andWhere(
        `
        (
            LOWER(user.fullName) LIKE LOWER(:keyword)
            OR LOWER(user.phoneNumber) LIKE LOWER(:keyword)
        )
        `,
        {
          keyword: `%${filter.keyword.trim()}%`,
        },
      );
    }

    queryBuilder
      .orderBy(`user.${filter.sortBy}`, filter.sortDirection)
      .skip(filter.offset)
      .take(filter.limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return new PagedResultDto(
      users.map(
        (user) =>
          new UserListItemDto(
            user.id,
            user.fullName,
            '', // email comes from Identity Service
            user.phoneNumber,
            user.avatarUrl,
            user.createdAt,
          ),
      ),
      total,
      filter.page,
      filter.limit,
    );
  }
}
