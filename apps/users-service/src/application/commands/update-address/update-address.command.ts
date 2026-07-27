export class UpdateAddressCommand {
  constructor(
    public readonly userId: string,
    public readonly addressId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phoneNumber: string,
    public readonly provinceCode: string,
    public readonly districtCode: string,
    public readonly districtName: string,
    public readonly wardCode: string,
    public readonly addressLine: string,
    public readonly postalCode: string | null,
    public readonly label: string,
  ) {}
}
