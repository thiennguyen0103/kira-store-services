import { NotFoundException } from 'libs/shared/exceptions/not-found.exception';

export class BrandNotFoundException extends NotFoundException {
  constructor(identifier?: string) {
    super('Brand', identifier);
  }
}
