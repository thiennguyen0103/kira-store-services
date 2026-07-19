import { IdentityId } from '../value-objects/user/identity-id.vo';
import { UserId } from '../value-objects/user/user-id.vo';
import { DomainEvent } from 'libs/shared/domain/domain-event';

export class UserCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(
    public readonly userId: UserId,
    public readonly identityId: IdentityId,
  ) {}
}
