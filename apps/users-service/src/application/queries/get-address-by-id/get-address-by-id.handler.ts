import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AddressDto } from '../../dto/address.dto';
import { AddressNotFoundException } from 'apps/users-service/src/domain/exceptions/address-not-found.exception';
import { UserQueryRepository } from '../repositories/user-query.repository';
import { GetAddressByIdQuery } from './get-address-by-id.query';

@QueryHandler(GetAddressByIdQuery)
export class GetAddressByIdHandler implements IQueryHandler<
  GetAddressByIdQuery,
  AddressDto
> {
  constructor(private readonly repository: UserQueryRepository) {}

  async execute(query: GetAddressByIdQuery): Promise<AddressDto> {
    const address = await this.repository.findAddressById(
      query.userId,
      query.addressId,
    );
    if (!address) {
      throw new AddressNotFoundException(query.addressId);
    }
    return address;
  }
}
