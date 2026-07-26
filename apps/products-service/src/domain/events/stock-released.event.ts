import { DomainEvent } from 'libs/shared/domain/domain-event';
import { ProductId } from '../value-objects/product/product-id.vo';
import { VariantId } from '../value-objects/product/variant-id.vo';

export class StockReleasedEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(
    public readonly productId: ProductId,
    public readonly variantId: VariantId,
    public readonly quantity: number,
  ) {}
}
