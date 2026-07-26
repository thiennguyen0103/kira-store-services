import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAddressCommand } from './update-address.command';
import { UserRepository } from 'apps/users-service/src/domain/repositories/user.repository';
import { UserId } from 'apps/users-service/src/domain/value-objects/user/user-id.vo';
import { UserNotFoundException } from 'apps/users-service/src/domain/exceptions/user-not-found.exception';
import { PhoneNumber } from 'apps/users-service/src/domain/value-objects/user/phone-number.vo';
import { PersonName } from 'apps/users-service/src/domain/value-objects/user/person-name.vo';
import { AddressLine } from 'apps/users-service/src/domain/value-objects/address/address-line.vo';
import { PostalCode } from 'apps/users-service/src/domain/value-objects/address/postal-code.vo';
import { Province } from 'apps/users-service/src/domain/value-objects/address/province.vo';
import { District } from 'apps/users-service/src/domain/value-objects/address/district.vo';
import { Ward } from 'apps/users-service/src/domain/value-objects/address/ward.vo';
import { EAddressLabel } from 'apps/users-service/src/domain/enums/address-label.enum';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

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
      throw new DomainException('Address not found.', {
        code: 'ADDRESS_NOT_FOUND',
      });
    }

    address.update({
      receiverName: PersonName.create({
        firstName: command.firstName,
        lastName: command.lastName,
      }),
      phoneNumber: PhoneNumber.create(command.phoneNumber, 'VN'),
      province: Province.create(command.provinceCode),
      district: District.create({
        code: command.districtCode,
        name: command.districtName,
      }),
      ward: Ward.create(command.wardCode),
      addressLine: AddressLine.create(command.addressLine),
      postalCode: command.postalCode
        ? PostalCode.create(command.postalCode)
        : undefined,
      label:
        EAddressLabel[
          command.label.toUpperCase() as keyof typeof EAddressLabel
        ],
    });

    user.updateAddress(address);

    await this.repository.save(user);
  }
}
