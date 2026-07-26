import { NotFoundException } from 'libs/shared/exceptions/not-found.exception';

export class CategoryNotFoundException extends NotFoundException {
  constructor(identifier?: string) {
    super('Category', identifier);
  }
}
