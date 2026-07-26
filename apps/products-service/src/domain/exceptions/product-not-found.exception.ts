import { NotFoundException } from 'libs/shared/exceptions/not-found.exception';

export class ProductNotFoundException extends NotFoundException {
  constructor(productId?: string) {
    super('Product not found', productId);
  }
}
