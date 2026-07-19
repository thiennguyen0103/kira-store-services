import { DomainEvent } from 'libs/shared/domain/domain-event';
import { UserId } from '../value-objects/user/user-id.vo';

export class UserProfileUpdatedEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(public readonly userId: UserId) {}
}
