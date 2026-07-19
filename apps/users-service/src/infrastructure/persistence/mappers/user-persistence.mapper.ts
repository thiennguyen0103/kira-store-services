import { AddressDto } from 'apps/users-service/src/application/dto/address.dto';
import { UserDetailDto } from 'apps/users-service/src/application/dto/user-detail.dto';
import { AddressOrmEntity } from '../entities/address.entity';
import { UserOrmEntity } from '../entities/user.entity';

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
}
