import { NotFoundException } from 'libs/shared/exceptions/not-found.exception';

export class CartNotFoundException extends NotFoundException {
  constructor(identifier?: string) {
    super('Cart', identifier);
  }
}
