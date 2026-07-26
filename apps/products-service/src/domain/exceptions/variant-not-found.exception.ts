import { NotFoundException } from 'libs/shared/exceptions/not-found.exception';

export class VariantNotFoundException extends NotFoundException {
  constructor(variantId?: string) {
    super('Product variant not found', variantId);
  }
}
