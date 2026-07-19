export class AddressDto {
  constructor(
    public readonly id: string,
    public readonly receiverName: string,
    public readonly phoneNumber: string,
    public readonly provinceCode: string,
    public readonly districtCode: string,
    public readonly wardCode: string,
    public readonly addressLine: string,
    public readonly postalCode: string,
    public readonly label: string,
    public readonly isDefault: boolean,
  ) {}
}
