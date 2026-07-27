import { NotFoundException } from 'libs/shared/exceptions/not-found.exception';

export class OrderNotFoundException extends NotFoundException {
  constructor(identifier?: string) {
    super('Order', identifier);
  }
}
