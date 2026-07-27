import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { parseAddressLabel } from 'apps/users-service/src/domain/enums/parse-address-label';
import { AddressNotFoundException } from 'apps/users-service/src/domain/exceptions/address-not-found.exception';
import { UserNotFoundException } from 'apps/users-service/src/domain/exceptions/user-not-found.exception';
import { UserRepository } from 'apps/users-service/src/domain/repositories/user.repository';
import { AddressLine } from 'apps/users-service/src/domain/value-objects/address/address-line.vo';
import { District } from 'apps/users-service/src/domain/value-objects/address/district.vo';
import { PostalCode } from 'apps/users-service/src/domain/value-objects/address/postal-code.vo';
import { Province } from 'apps/users-service/src/domain/value-objects/address/province.vo';
import { Ward } from 'apps/users-service/src/domain/value-objects/address/ward.vo';
import { PersonName } from 'apps/users-service/src/domain/value-objects/user/person-name.vo';
import { PhoneNumber } from 'apps/users-service/src/domain/value-objects/user/phone-number.vo';
import { UserId } from 'apps/users-service/src/domain/value-objects/user/user-id.vo';
import { UpdateAddressCommand } from './update-address.command';

@CommandHandler(UpdateAddressCommand)
export class UpdateAddressHandler implements ICommandHandler<UpdateAddressCommand> {
  constructor(private readonly repository: UserRepository) {}

  async execute(command: UpdateAddressCommand): Promise<void> {
    const user = await this.repository.findById(UserId.restore(command.userId));

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    const address = user.addresses.find(
      (x) => x.id.value === command.addressId,
    );

    if (!address) {
      throw new AddressNotFoundException(command.addressId);
    }

    const districtName = command.districtName.trim() || command.districtCode;

    address.update({
      receiverName: PersonName.create({
        firstName: command.firstName,
        lastName: command.lastName,
      }),
      phoneNumber: PhoneNumber.create(command.phoneNumber, 'VN'),
      province: Province.create(command.provinceCode),
      district: District.create({
        code: command.districtCode,
        name: districtName,
      }),
      ward: Ward.create(command.wardCode),
      addressLine: AddressLine.create(command.addressLine),
      postalCode: command.postalCode
        ? PostalCode.create(command.postalCode)
        : undefined,
      label: parseAddressLabel(command.label),
    });

    user.updateAddress(address);

    await this.repository.save(user);
  }
}
