import { DomainEvent } from 'libs/shared/domain/domain-event';
import { IdentityId } from '../value-objects/identity-id.vo';

export class AccountLockedEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(
    public readonly identityId: IdentityId,
    public readonly lockedUntil: Date,
  ) {}
}
