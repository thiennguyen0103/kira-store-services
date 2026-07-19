import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDefaultAddressQuery } from './get-default-address.query';
import { AddressDto } from '../../dto/address.dto';
import { UserQueryRepository } from '../repositories/user-query.repository';
import { DefaultAddressNotFoundException } from 'apps/users-service/src/domain/exceptions/default-address-not-found.exception';

@QueryHandler(GetDefaultAddressQuery)
export class GetDefaultAddressHandler implements IQueryHandler<
  GetDefaultAddressQuery,
  AddressDto
> {
  constructor(private readonly repository: UserQueryRepository) {}

  async execute(query: GetDefaultAddressQuery): Promise<AddressDto> {
    const defaultAddress = await this.repository.findDefaultAddress(
      query.userId,
    );

    if (!defaultAddress) {
      throw new DefaultAddressNotFoundException(query.userId);
    }

    return defaultAddress;
  }
}
