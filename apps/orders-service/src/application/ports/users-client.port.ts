export interface AddressSnapshot {
  addressId: string;
  receiverName: string;
  phoneNumber: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  addressLine: string;
  postalCode: string;
}

export abstract class UsersClientPort {
  abstract getAddressById(
    userId: string,
    addressId: string,
  ): Promise<AddressSnapshot>;
}
