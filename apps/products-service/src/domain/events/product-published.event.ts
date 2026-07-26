import { DomainEvent } from 'libs/shared/domain/domain-event';
import { ProductId } from '../value-objects/product/product-id.vo';

export class ProductPublishedEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(public readonly productId: ProductId) {}
}
