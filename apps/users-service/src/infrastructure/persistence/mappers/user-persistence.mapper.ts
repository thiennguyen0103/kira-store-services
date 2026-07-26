import { Injectable } from '@nestjs/common';
import { AddressDto } from 'apps/users-service/src/application/dto/address.dto';
import { UserDetailDto } from 'apps/users-service/src/application/dto/user-detail.dto';
import { Address } from 'apps/users-service/src/domain/entities/address.entity';
import { User } from 'apps/users-service/src/domain/entities/user.entity';
import { EAddressLabel } from 'apps/users-service/src/domain/enums/address-label.enum';
import { AddressId } from 'apps/users-service/src/domain/value-objects/address/address-id.vo';
import { AddressLine } from 'apps/users-service/src/domain/value-objects/address/address-line.vo';
import { District } from 'apps/users-service/src/domain/value-objects/address/district.vo';
import { PostalCode } from 'apps/users-service/src/domain/value-objects/address/postal-code.vo';
import { Province } from 'apps/users-service/src/domain/value-objects/address/province.vo';
import { Ward } from 'apps/users-service/src/domain/value-objects/address/ward.vo';
import { Avatar } from 'apps/users-service/src/domain/value-objects/user/avatar.vo';
import { BirthDate } from 'apps/users-service/src/domain/value-objects/user/birth-date.vo';
import { Gender } from 'apps/users-service/src/domain/value-objects/user/gender.vo';
import { IdentityId } from 'apps/users-service/src/domain/value-objects/user/identity-id.vo';
import { PersonName } from 'apps/users-service/src/domain/value-objects/user/person-name.vo';
import { PhoneNumber } from 'apps/users-service/src/domain/value-objects/user/phone-number.vo';
import { UserId } from 'apps/users-service/src/domain/value-objects/user/user-id.vo';
import { UserProfile } from 'apps/users-service/src/domain/value-objects/user/user-profile.vo';
import { AddressOrmEntity } from '../entities/address.entity';
import { UserOrmEntity } from '../entities/user.entity';

@Injectable()
export class UserPersistenceMapper {
  toDetailDto(user: UserOrmEntity): UserDetailDto {
    return new UserDetailDto(
      user.id,
      user.identityId,
      user.fullName,
      user.avatarUrl,
      user.phoneNumber,
      user.gender,
      user.birthday ? new Date(user.birthday) : null,
      (user.addresses ?? []).map((address) => this.toAddressDto(address)),
      user.createdAt,
      user.updatedAt,
    );
  }

  toAddressDto(address: AddressOrmEntity): AddressDto {
    return new AddressDto(
      address.id,
      address.receiverName,
      address.phoneNumber,
      address.provinceCode,
      address.districtCode,
      address.wardCode,
      address.addressLine,
      address.postalCode,
      address.label,
      address.isDefault,
    );
  }

  toDomain(user: UserOrmEntity): User {
    return User.restore(UserId.restore(user.id), {
      identityId: IdentityId.restore(user.identityId),
      profile: UserProfile.create({
        name: PersonName.fromFullName(user.fullName),
        phone: user.phoneNumber
          ? PhoneNumber.fromPersisted(user.phoneNumber)
          : undefined,
        avatar: user.avatarUrl ? Avatar.restore(user.avatarUrl) : undefined,
        gender: user.gender ? Gender.create(user.gender) : undefined,
        birthDate: user.birthday
          ? BirthDate.restore(new Date(user.birthday))
          : undefined,
      }),
      addresses: (user.addresses ?? []).map((address) =>
        this.toAddressDomain(address),
      ),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  toAddressDomain(address: AddressOrmEntity): Address {
    return Address.restore(AddressId.restore(address.id), {
      receiverName: PersonName.fromFullName(address.receiverName),
      phoneNumber: PhoneNumber.fromPersisted(address.phoneNumber),
      province: Province.restore(address.provinceCode),
      // ORM currently stores codes only; name is rehydrated from code.
      district: District.restore({
        code: address.districtCode,
        name: address.districtCode,
      }),
      ward: Ward.restore(address.wardCode),
      addressLine: AddressLine.restore(address.addressLine),
      postalCode: address.postalCode
        ? PostalCode.restore(address.postalCode)
        : undefined,
      label: address.label as EAddressLabel,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    });
  }

  toUserOrm(user: User): UserOrmEntity {
    const orm = new UserOrmEntity();

    orm.id = user.id.value;
    orm.identityId = user.identityId.value;
    orm.fullName = user.profile.name.fullName;
    orm.avatarUrl = user.profile.avatar?.url ?? null;
    orm.phoneNumber = user.profile.phone?.value ?? null;
    orm.gender = user.profile.gender?.value ?? null;
    orm.birthday = user.profile.birthDate?.value ?? null;
    orm.createdAt = user.createdAt;
    orm.updatedAt = user.updatedAt;

    return orm;
  }

  toAddressOrm(address: Address, userId: string): AddressOrmEntity {
    const orm = new AddressOrmEntity();

    orm.id = address.id.value;
    orm.user = { id: userId } as UserOrmEntity;
    orm.receiverName = address.receiverName.fullName;
    orm.phoneNumber = address.phoneNumber.value;
    orm.provinceCode = address.province.code;
    orm.districtCode = address.district.code;
    orm.wardCode = address.ward.code;
    orm.addressLine = address.addressLine.value;
    orm.postalCode = address.postalCode?.value ?? '';
    orm.label = address.label;
    orm.isDefault = address.isDefault;
    orm.createdAt = address.createdAt;
    orm.updatedAt = address.updatedAt;

    return orm;
  }
}
