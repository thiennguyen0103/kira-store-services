import { NotFoundException } from 'libs/shared/exceptions/not-found.exception';

export class DefaultAddressNotFoundException extends NotFoundException {
  constructor(userId?: string) {
    super('Default address', userId);
  }
}
