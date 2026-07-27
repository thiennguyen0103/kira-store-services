import { DomainException } from 'libs/shared/exceptions/domain.exception';

export class EmptyCartException extends DomainException {
  constructor() {
    super('Cart is empty.', { code: 'EMPTY_CART' });
  }
}
