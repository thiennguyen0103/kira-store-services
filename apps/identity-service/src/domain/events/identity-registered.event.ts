import { DomainEvent } from 'libs/shared/domain/domain-event';
import { IdentityId } from '../value-objects/identity-id.vo';
import { Email } from '../value-objects/email.vo';

export class IdentityRegisteredEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(
    public readonly identityId: IdentityId,
    public readonly email: Email,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {}
}
