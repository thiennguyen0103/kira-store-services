import { NotFoundException } from 'libs/shared/exceptions/not-found.exception';

export class IdentityNotFoundException extends NotFoundException {
  constructor(identityId: string) {
    super(`Identity with id ${identityId} not found`);
  }
}
