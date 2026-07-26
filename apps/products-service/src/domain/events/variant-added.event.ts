import { DomainEvent } from 'libs/shared/domain/domain-event';
import { ProductId } from '../value-objects/product/product-id.vo';
import { VariantId } from '../value-objects/product/variant-id.vo';
import { Sku } from '../value-objects/product/sku.vo';

export class VariantAddedEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(
    public readonly productId: ProductId,
    public readonly variantId: VariantId,
    public readonly sku: Sku,
  ) {}
}
