import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Address } from 'apps/users-service/src/domain/entities/address.entity';
import { EAddressLabel } from 'apps/users-service/src/domain/enums/address-label.enum';
import { UserNotFoundException } from 'apps/users-service/src/domain/exceptions/user-not-found.exception';
import { UserRepository } from 'apps/users-service/src/domain/repositories/user.repository';
import { AddressId } from 'apps/users-service/src/domain/value-objects/address/address-id.vo';
import { AddressLine } from 'apps/users-service/src/domain/value-objects/address/address-line.vo';
import { District } from 'apps/users-service/src/domain/value-objects/address/district.vo';
import { PostalCode } from 'apps/users-service/src/domain/value-objects/address/postal-code.vo';
import { Province } from 'apps/users-service/src/domain/value-objects/address/province.vo';
import { Ward } from 'apps/users-service/src/domain/value-objects/address/ward.vo';
import { PersonName } from 'apps/users-service/src/domain/value-objects/user/person-name.vo';
import { PhoneNumber } from 'apps/users-service/src/domain/value-objects/user/phone-number.vo';
import { UserId } from 'apps/users-service/src/domain/value-objects/user/user-id.vo';
import { AddAddressCommand } from './add-address.command';

@CommandHandler(AddAddressCommand)
export class AddAddressHandler implements ICommandHandler<AddAddressCommand> {
  constructor(private readonly repository: UserRepository) {}

  async execute(command: AddAddressCommand): Promise<void> {
    const user = await this.repository.findById(UserId.restore(command.userId));

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    user.addAddress(
      Address.create(AddressId.create(), {
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
        isDefault: command.isDefault,
      }),
    );

    await this.repository.save(user);
  }
}
