import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AddressSnapshot,
  UsersClientPort,
} from 'apps/orders-service/src/application/ports/users-client.port';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import type {
  GetAddressByIdRequest,
  UsersServiceClient,
} from 'libs/shared/generated/users';

@Injectable()
export class UsersClient extends UsersClientPort implements OnModuleInit {
  private usersService!: UsersServiceClient;

  constructor(
    @Inject(SERVICE_TOKENS.USERS_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.usersService = this.client.getService<UsersServiceClient>(
      GRPC_SERVICE_NAMES.USERS,
    );
  }

  async getAddressById(
    userId: string,
    addressId: string,
  ): Promise<AddressSnapshot> {
    const request: GetAddressByIdRequest = { userId, addressId };
    try {
      const response = await firstValueFrom(
        this.usersService.getAddressById(request),
      );
      const address = response.address;
      if (!address) {
        throw new DomainException('Address not found.', {
          code: 'ADDRESS_NOT_FOUND',
          details: { userId, addressId },
        });
      }
      return {
        addressId: address.id,
        receiverName: address.receiverName,
        phoneNumber: address.phoneNumber,
        provinceCode: address.provinceCode,
        districtCode: address.districtCode,
        wardCode: address.wardCode,
        addressLine: address.addressLine,
        postalCode: address.postalCode,
      };
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }
      throw new DomainException('Failed to fetch address.', {
        code: 'ADDRESS_LOOKUP_FAILED',
        details: { userId, addressId },
        cause: error instanceof Error ? error : undefined,
      });
    }
  }
}
