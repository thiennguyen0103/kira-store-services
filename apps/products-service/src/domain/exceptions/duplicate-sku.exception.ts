import { DomainException } from 'libs/shared/exceptions/domain.exception';

export class DuplicateSkuException extends DomainException {
  constructor(sku: string) {
    super(`SKU '${sku}' already exists on this product.`, {
      code: 'DUPLICATE_SKU',
      details: { sku },
    });
  }
}
