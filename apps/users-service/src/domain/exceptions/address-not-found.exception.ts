import { NotFoundException } from 'libs/shared/exceptions/not-found.exception';

export class AddressNotFoundException extends NotFoundException {
  constructor(addressId?: string) {
    super('Address', addressId);
  }
}
