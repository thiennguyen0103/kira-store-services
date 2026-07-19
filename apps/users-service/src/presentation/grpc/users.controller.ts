import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { AddressDto } from '../../application/dto/address.dto';
import { SearchUsersDto } from '../../application/dto/search-users.dto';
import { UserDetailDto } from '../../application/dto/user-detail.dto';
import { UserListItemDto } from '../../application/dto/user-list-item.dto';
import { GetAddressesQuery } from '../../application/queries/get-addresses/get-addresses.query';
import { GetDefaultAddressQuery } from '../../application/queries/get-default-addresses/get-default-address.query';
import { GetUserByIdentityIdQuery } from '../../application/queries/get-user-by-identity-id/get-user-by-identity-id.query';
import { GetUserQuery } from '../../application/queries/get-user/get-user.query';
import { SearchUsersQuery } from '../../application/queries/search-users/search-users.query';

@Controller('users')
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserDetailDto> {
    return this.queryBus.execute<GetUserQuery, UserDetailDto>(
      new GetUserQuery(id),
    );
  }

  @Get('identity/:identityId')
  async getUserByIdentityId(
    @Param('identityId') identityId: string,
  ): Promise<UserDetailDto> {
    return this.queryBus.execute<GetUserByIdentityIdQuery, UserDetailDto>(
      new GetUserByIdentityIdQuery(identityId),
    );
  }

  @Get('search')
  async searchUsers(
    @Query() filters: SearchUsersDto,
  ): Promise<PagedResultDto<UserListItemDto>> {
    return this.queryBus.execute<
      SearchUsersQuery,
      PagedResultDto<UserListItemDto>
    >(new SearchUsersQuery(filters));
  }

  @Get(':id/addresses')
  async getAddresses(@Param('id') id: string): Promise<AddressDto[]> {
    return this.queryBus.execute<GetAddressesQuery, AddressDto[]>(
      new GetAddressesQuery(id),
    );
  }

  @Get(':id/default-address')
  async getDefaultAddress(@Param('id') id: string): Promise<AddressDto> {
    return this.queryBus.execute<GetDefaultAddressQuery, AddressDto>(
      new GetDefaultAddressQuery(id),
    );
  }
}
