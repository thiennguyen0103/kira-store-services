import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AddressDto } from '../../dto/address.dto';
import { UserQueryRepository } from '../repositories/user-query.repository';
import { GetAddressesQuery } from './get-addresses.query';

@QueryHandler(GetAddressesQuery)
export class GetAddressesHandler implements IQueryHandler<
  GetAddressesQuery,
  readonly AddressDto[]
> {
  constructor(private readonly repository: UserQueryRepository) {}

  async execute(query: GetAddressesQuery): Promise<AddressDto[]> {
    return this.repository.findAddresses(query.userId);
  }
}
