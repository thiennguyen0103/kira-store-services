import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MoneyResponseDto {
  @ApiProperty()
  amountMinor!: number;

  @ApiProperty()
  currency!: string;
}

export class OrderItemResponseDto {
  @ApiProperty()
  productId!: string;

  @ApiProperty()
  variantId!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ type: MoneyResponseDto })
  unitPrice!: MoneyResponseDto;

  @ApiProperty({ type: MoneyResponseDto })
  lineTotal!: MoneyResponseDto;
}

export class ShippingAddressResponseDto {
  @ApiProperty()
  addressId!: string;

  @ApiProperty()
  receiverName!: string;

  @ApiProperty()
  phoneNumber!: string;

  @ApiProperty()
  provinceCode!: string;

  @ApiProperty()
  districtCode!: string;

  @ApiProperty()
  wardCode!: string;

  @ApiProperty()
  addressLine!: string;

  @ApiProperty()
  postalCode!: string;
}

export class OrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty({ type: ShippingAddressResponseDto })
  shippingAddress!: ShippingAddressResponseDto;

  @ApiProperty({ type: MoneyResponseDto })
  total!: MoneyResponseDto;

  @ApiProperty()
  paymentProvider!: string;

  @ApiPropertyOptional()
  paymentId?: string;

  @ApiPropertyOptional()
  paymentUrl?: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiPropertyOptional()
  cancelledAt?: string;

  @ApiPropertyOptional()
  confirmedAt?: string;
}
