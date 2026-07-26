import { DomainEvent } from 'libs/shared/domain/domain-event';
import { BrandId } from '../value-objects/brand/brand-id.vo';

export class BrandCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(public readonly brandId: BrandId) {}
}
