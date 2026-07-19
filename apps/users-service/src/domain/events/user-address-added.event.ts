import { DomainEvent } from 'libs/shared/domain/domain-event';
import { UserId } from '../value-objects/user/user-id.vo';
import { AddressId } from '../value-objects/address/address-id.vo';

export class UserAddressAddedEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(
    public readonly userId: UserId,
    public readonly addressId: AddressId,
  ) {}
}
