import { NotFoundException } from 'libs/shared/exceptions/not-found.exception';

export class UserNotFoundException extends NotFoundException {
  constructor(userId?: string) {
    super('User not found', userId);
  }
}
