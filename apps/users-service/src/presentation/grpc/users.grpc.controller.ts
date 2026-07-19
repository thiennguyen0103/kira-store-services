import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  AddressResponse,
  GetAddressesRequest,
  GetDefaultAddressRequest,
  GetUserRequest,
  UserDetailResponse,
} from 'libs/shared/generated/users';
import { AddressDto } from '../../application/dto/address.dto';
import { UserDetailDto } from '../../application/dto/user-detail.dto';
import { GetAddressesQuery } from '../../application/queries/get-addresses/get-addresses.query';
import { GetDefaultAddressQuery } from '../../application/queries/get-default-addresses/get-default-address.query';
import { GetUserQuery } from '../../application/queries/get-user/get-user.query';
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
  async getAddresses(request: GetAddressesRequest): Promise<AddressResponse[]> {
    const dto = await this.queryBus.execute<GetAddressesQuery, AddressDto[]>(
      new GetAddressesQuery(request.userId),
    );

    return dto.map((address) => AddressResponseMapper.toResponse(address));
  }

  @GrpcMethod('UsersService', 'GetDefaultAddress')
  async getDefaultAddress(
    request: GetDefaultAddressRequest,
  ): Promise<AddressResponse> {
    const dto = await this.queryBus.execute<GetDefaultAddressQuery, AddressDto>(
      new GetDefaultAddressQuery(request.userId),
    );

    return AddressResponseMapper.toResponse(dto);
  }
}
