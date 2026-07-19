import { DomainEvent } from 'libs/shared/domain/domain-event';
import { AddressId } from '../value-objects/address/address-id.vo';
import { UserId } from '../value-objects/user/user-id.vo';

export class DefaultAddressChangedEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(
    public readonly userId: UserId,
    public readonly addressId: AddressId,
  ) {}
}
