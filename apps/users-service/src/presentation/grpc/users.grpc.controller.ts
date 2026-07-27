import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { GRPC_SERVICE_NAMES } from 'libs/shared/constants';
import type {
  AddAddressRequest,
  GetAddressesRequest,
  GetAddressesResponse,
  GetAddressByIdRequest,
  GetAddressByIdResponse,
  GetDefaultAddressRequest,
  GetDefaultAddressResponse,
  GetUserByIdentityIdRequest,
  GetUserByIdentityIdResponse,
  GetUserRequest,
  MutationResponse,
  RemoveAddressRequest,
  SearchUsersRequest,
  SearchUsersResponse,
  SetDefaultAddressRequest,
  UpdateAddressRequest,
  UpdateAvatarRequest,
  UpdateProfileRequest,
  UserDetailResponse,
} from 'libs/shared/generated/users';
import { AddAddressCommand } from '../../application/commands/add-address/add-address.command';
import { RemoveAddressCommand } from '../../application/commands/remove-address/remove-address.command';
import { SetDefaultAddressCommand } from '../../application/commands/set-default-address/set-default-address.command';
import { UpdateAddressCommand } from '../../application/commands/update-address/update-address.command';
import { UpdateAvatarCommand } from '../../application/commands/update-avatar/update-avatar.command';
import { UpdateProfileCommand } from '../../application/commands/update-profile/update-profile.command';
import { AddressDto } from '../../application/dto/address.dto';
import { SearchUsersDto } from '../../application/dto/search-users.dto';
import { UserDetailDto } from '../../application/dto/user-detail.dto';
import { UserListItemDto } from '../../application/dto/user-list-item.dto';
import { GetAddressesQuery } from '../../application/queries/get-addresses/get-addresses.query';
import { GetAddressByIdQuery } from '../../application/queries/get-address-by-id/get-address-by-id.query';
import { GetDefaultAddressQuery } from '../../application/queries/get-default-addresses/get-default-address.query';
import { GetUserByIdentityIdQuery } from '../../application/queries/get-user-by-identity-id/get-user-by-identity-id.query';
import { GetUserQuery } from '../../application/queries/get-user/get-user.query';
import { SearchUsersQuery } from '../../application/queries/search-users/search-users.query';
import { AddressResponseMapper } from './mapper/address-response.mapper';
import { UserResponseMapper } from './mapper/user-response.mapper';

@Controller()
export class UserGrpcController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @GrpcMethod(GRPC_SERVICE_NAMES.USERS, 'GetUser')
  async getUser(request: GetUserRequest): Promise<UserDetailResponse> {
    return this.execute(async () => {
      const dto = await this.queryBus.execute<GetUserQuery, UserDetailDto>(
        new GetUserQuery(request.userId),
      );
      return UserResponseMapper.toDetail(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USERS, 'GetAddresses')
  async getAddresses(
    request: GetAddressesRequest,
  ): Promise<GetAddressesResponse> {
    return this.execute(async () => {
      const dto = await this.queryBus.execute<GetAddressesQuery, AddressDto[]>(
        new GetAddressesQuery(request.userId),
      );
      return {
        addresses: dto.map((address) =>
          AddressResponseMapper.toResponse(address),
        ),
      };
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USERS, 'GetDefaultAddress')
  async getDefaultAddress(
    request: GetDefaultAddressRequest,
  ): Promise<GetDefaultAddressResponse> {
    return this.execute(async () => {
      const dto = await this.queryBus.execute<
        GetDefaultAddressQuery,
        AddressDto
      >(new GetDefaultAddressQuery(request.userId));
      return {
        address: AddressResponseMapper.toResponse(dto),
      };
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USERS, 'GetAddressById')
  async getAddressById(
    request: GetAddressByIdRequest,
  ): Promise<GetAddressByIdResponse> {
    return this.execute(async () => {
      const dto = await this.queryBus.execute<GetAddressByIdQuery, AddressDto>(
        new GetAddressByIdQuery(request.userId, request.addressId),
      );
      return {
        address: AddressResponseMapper.toResponse(dto),
      };
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USERS, 'GetUserByIdentityId')
  async getUserByIdentityId(
    request: GetUserByIdentityIdRequest,
  ): Promise<GetUserByIdentityIdResponse> {
    return this.execute(async () => {
      const dto = await this.queryBus.execute<
        GetUserByIdentityIdQuery,
        UserDetailDto
      >(new GetUserByIdentityIdQuery(request.identityId));
      return {
        user: UserResponseMapper.toDetail(dto),
      };
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USERS, 'SearchUsers')
  async searchUsers(request: SearchUsersRequest): Promise<SearchUsersResponse> {
    return this.execute(async () => {
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
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USERS, 'UpdateProfile')
  async updateProfile(
    request: UpdateProfileRequest,
  ): Promise<MutationResponse> {
    return this.execute(async () => {
      await this.commandBus.execute(
        new UpdateProfileCommand(
          request.userId,
          request.firstName,
          request.lastName,
          optionalString(request.phoneNumber),
          optionalString(request.gender),
          optionalBirthday(request.birthday),
        ),
      );
      return { success: true };
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USERS, 'UpdateAvatar')
  async updateAvatar(request: UpdateAvatarRequest): Promise<MutationResponse> {
    return this.execute(async () => {
      await this.commandBus.execute(
        new UpdateAvatarCommand(request.userId, request.avatarUrl),
      );
      return { success: true };
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USERS, 'AddAddress')
  async addAddress(request: AddAddressRequest): Promise<MutationResponse> {
    return this.execute(async () => {
      await this.commandBus.execute(
        new AddAddressCommand(
          request.userId,
          request.firstName,
          request.lastName,
          request.phoneNumber,
          request.provinceCode,
          request.districtCode,
          request.districtName,
          request.wardCode,
          request.addressLine,
          optionalString(request.postalCode) ?? null,
          request.label,
          request.isDefault,
        ),
      );
      return { success: true };
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USERS, 'UpdateAddress')
  async updateAddress(
    request: UpdateAddressRequest,
  ): Promise<MutationResponse> {
    return this.execute(async () => {
      await this.commandBus.execute(
        new UpdateAddressCommand(
          request.userId,
          request.addressId,
          request.firstName,
          request.lastName,
          request.phoneNumber,
          request.provinceCode,
          request.districtCode,
          request.districtName,
          request.wardCode,
          request.addressLine,
          optionalString(request.postalCode) ?? null,
          request.label,
        ),
      );
      return { success: true };
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USERS, 'RemoveAddress')
  async removeAddress(
    request: RemoveAddressRequest,
  ): Promise<MutationResponse> {
    return this.execute(async () => {
      await this.commandBus.execute(
        new RemoveAddressCommand(request.userId, request.addressId),
      );
      return { success: true };
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.USERS, 'SetDefaultAddress')
  async setDefaultAddress(
    request: SetDefaultAddressRequest,
  ): Promise<MutationResponse> {
    return this.execute(async () => {
      await this.commandBus.execute(
        new SetDefaultAddressCommand(request.userId, request.addressId),
      );
      return { success: true };
    });
  }

  private async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw this.toRpcException(error);
    }
  }

  private toRpcException(error: unknown): RpcException {
    if (error instanceof DomainException) {
      return new RpcException({
        code: this.mapGrpcCode(error.code),
        message: error.message,
      });
    }

    if (error instanceof Error) {
      return new RpcException({
        code: GrpcStatus.INTERNAL,
        message: error.message,
      });
    }

    return new RpcException({
      code: GrpcStatus.INTERNAL,
      message: 'Internal error',
    });
  }

  private mapGrpcCode(code: string): GrpcStatus {
    if (code.endsWith('_NOT_FOUND')) {
      return GrpcStatus.NOT_FOUND;
    }
    return GrpcStatus.INVALID_ARGUMENT;
  }
}

function optionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function optionalBirthday(value: string | undefined): Date | undefined {
  const trimmed = optionalString(value);
  if (!trimmed) {
    return undefined;
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new DomainException('Invalid birthday.', {
      code: 'INVALID_BIRTHDAY',
    });
  }
  return date;
}
