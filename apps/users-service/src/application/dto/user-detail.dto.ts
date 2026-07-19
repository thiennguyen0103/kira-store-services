import { AddressDto } from './address.dto';

export class UserDetailDto {
  constructor(
    public readonly id: string,
    public readonly identityId: string,
    public readonly fullName: string,
    public readonly avatarUrl: string | null,
    public readonly phoneNumber: string | null,
    public readonly gender: string | null,
    public readonly birthday: Date | null,
    public readonly addresses: readonly AddressDto[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
