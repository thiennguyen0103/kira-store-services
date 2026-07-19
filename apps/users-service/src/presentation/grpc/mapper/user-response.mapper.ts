import { AddressDto } from 'apps/users-service/src/application/dto/address.dto';
import { UserDetailDto } from 'apps/users-service/src/application/dto/user-detail.dto';
import {
  AddressResponse,
  UserDetailResponse,
} from 'libs/shared/generated/users';

export class UserResponseMapper {
  static toDetail(dto: UserDetailDto): UserDetailResponse {
    return {
      id: dto.id,
      identityId: dto.identityId,
      fullName: dto.fullName,
      avatarUrl: dto.avatarUrl ?? '',
      phoneNumber: dto.phoneNumber ?? '',
      gender: dto.gender ?? '',
      birthday: dto.birthday?.toISOString() ?? '',
      addresses: dto.addresses.map((address) =>
        UserResponseMapper.toAddress(address),
      ),
      createdAt: dto.createdAt.toISOString(),
      updatedAt: dto.updatedAt.toISOString(),
    };
  }

  static toAddress(dto: AddressDto): AddressResponse {
    return {
      id: dto.id,
      receiverName: dto.receiverName,
      phoneNumber: dto.phoneNumber,
      provinceCode: dto.provinceCode,
      districtCode: dto.districtCode,
      wardCode: dto.wardCode,
      addressLine: dto.addressLine,
      postalCode: dto.postalCode ?? '',
      label: dto.label,
      isDefault: dto.isDefault,
    };
  }
}
