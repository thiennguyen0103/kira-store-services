import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import type {
  GetAddressesRequest,
  GetAddressesResponse,
  GetDefaultAddressRequest,
  GetDefaultAddressResponse,
  GetUserByIdentityIdRequest,
  GetUserByIdentityIdResponse,
  GetUserRequest,
  SearchUsersRequest,
  SearchUsersResponse,
  UserDetailResponse,
} from 'libs/shared/generated/users';
import { AddressDto } from '../../application/dto/address.dto';
import { SearchUsersDto } from '../../application/dto/search-users.dto';
import { UserDetailDto } from '../../application/dto/user-detail.dto';
import { UserListItemDto } from '../../application/dto/user-list-item.dto';
import { GetAddressesQuery } from '../../application/queries/get-addresses/get-addresses.query';
import { GetDefaultAddressQuery } from '../../application/queries/get-default-addresses/get-default-address.query';
import { GetUserByIdentityIdQuery } from '../../application/queries/get-user-by-identity-id/get-user-by-identity-id.query';
import { GetUserQuery } from '../../application/queries/get-user/get-user.query';
import { SearchUsersQuery } from '../../application/queries/search-users/search-users.query';
import { AddressResponseMapper } from './mapper/address-response.mapper';
import { UserResponseMapper } from './mapper/user-response.mapper';

@Controller()
export class UserGrpcController {
  constructor(private readonly queryBus: QueryBus) {}

  @GrpcMethod('UsersService', 'GetUser')
  async getUser(request: GetUserRequest): Promise<UserDetailResponse> {
    const dto = await this.queryBus.execute<GetUserQuery, UserDetailDto>(
      new GetUserQuery(request.userId),
    );

    return UserResponseMapper.toDetail(dto);
  }

  @GrpcMethod('UsersService', 'GetAddresses')
  async getAddresses(
    request: GetAddressesRequest,
  ): Promise<GetAddressesResponse> {
    const dto = await this.queryBus.execute<GetAddressesQuery, AddressDto[]>(
      new GetAddressesQuery(request.userId),
    );

    return {
      addresses: dto.map((address) =>
        AddressResponseMapper.toResponse(address),
      ),
    };
  }

  @GrpcMethod('UsersService', 'GetDefaultAddress')
  async getDefaultAddress(
    request: GetDefaultAddressRequest,
  ): Promise<GetDefaultAddressResponse> {
    const dto = await this.queryBus.execute<GetDefaultAddressQuery, AddressDto>(
      new GetDefaultAddressQuery(request.userId),
    );

    return {
      address: AddressResponseMapper.toResponse(dto),
    };
  }

  @GrpcMethod('UsersService', 'GetUserByIdentityId')
  async getUserByIdentityId(
    request: GetUserByIdentityIdRequest,
  ): Promise<GetUserByIdentityIdResponse> {
    const dto = await this.queryBus.execute<
      GetUserByIdentityIdQuery,
      UserDetailDto
    >(new GetUserByIdentityIdQuery(request.identityId));

    return {
      user: UserResponseMapper.toDetail(dto),
    };
  }

  @GrpcMethod('UsersService', 'SearchUsers')
  async searchUsers(request: SearchUsersRequest): Promise<SearchUsersResponse> {
    const filters = new SearchUsersDto(
      request.page || 1,
      request.limit || 20,
      request.query || undefined,
    );

    const result = await this.queryBus.execute<
      SearchUsersQuery,
      PagedResultDto<UserListItemDto>
    >(new SearchUsersQuery(filters));

    return {
      users: result.items.map((user) => UserResponseMapper.toListItem(user)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
