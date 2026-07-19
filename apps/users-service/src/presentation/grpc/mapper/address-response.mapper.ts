import { AddressDto } from 'apps/users-service/src/application/dto/address.dto';
import { AddressResponse } from 'libs/shared/generated/users';

export class AddressResponseMapper {
  static toResponse(dto: AddressDto): AddressResponse {
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
