import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Jane Doe' })
  receiverName!: string;

  @ApiProperty({ example: '+84901234567' })
  phoneNumber!: string;

  @ApiProperty({ example: '79' })
  provinceCode!: string;

  @ApiProperty({ example: '760' })
  districtCode!: string;

  @ApiProperty({ example: '26734' })
  wardCode!: string;

  @ApiProperty({ example: '123 Nguyen Hue' })
  addressLine!: string;

  @ApiProperty({ example: '700000' })
  postalCode!: string;

  @ApiProperty({ example: 'Home' })
  label!: string;

  @ApiProperty({ example: true })
  isDefault!: boolean;
}

export class UserDetailResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  identityId!: string;

  @ApiProperty({ example: 'Jane Doe' })
  fullName!: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  email!: string;

  @ApiProperty({ example: 'https://cdn.example.com/avatar.jpg' })
  avatarUrl!: string;

  @ApiProperty({ example: '+84901234567' })
  phoneNumber!: string;

  @ApiProperty({ example: 'FEMALE' })
  gender!: string;

  @ApiProperty({ example: '1995-06-15' })
  birthday!: string;

  @ApiProperty({ type: [AddressResponseDto] })
  addresses!: AddressResponseDto[];

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  updatedAt!: string;
}

export class MutationResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;
}

export class GetAddressesResponseDto {
  @ApiProperty({ type: [AddressResponseDto] })
  addresses!: AddressResponseDto[];
}

export class GetDefaultAddressResponseDto {
  @ApiPropertyOptional({ type: AddressResponseDto })
  address?: AddressResponseDto;
}

export class GetUserByIdentityIdResponseDto {
  @ApiPropertyOptional({ type: UserDetailResponseDto })
  user?: UserDetailResponseDto;
}

export class UserListItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Jane Doe' })
  fullName!: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  email!: string;

  @ApiProperty({ example: '+84901234567' })
  phoneNumber!: string;

  @ApiProperty({ example: 'https://cdn.example.com/avatar.jpg' })
  avatarUrl!: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  createdAt!: string;
}

export class SearchUsersResponseDto {
  @ApiProperty({ type: [UserListItemResponseDto] })
  users!: UserListItemResponseDto[];

  @ApiProperty({ example: 3 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;
}
