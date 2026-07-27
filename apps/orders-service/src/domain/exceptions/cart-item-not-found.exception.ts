import { DomainException } from 'libs/shared/exceptions/domain.exception';

export class CartItemNotFoundException extends DomainException {
  constructor(productId: string, variantId: string) {
    super('Cart item not found.', {
      code: 'CART_ITEM_NOT_FOUND',
      details: { productId, variantId },
    });
  }
}
