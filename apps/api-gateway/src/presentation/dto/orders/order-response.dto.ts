import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MoneyResponseDto } from '../products/product-response.dto';

export { MoneyResponseDto };

export class CartItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  productId!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  variantId!: string;

  @ApiProperty({ example: 'Classic T-Shirt' })
  productName!: string;

  @ApiProperty({ example: 'SKU-001' })
  sku!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ type: MoneyResponseDto })
  unitPrice!: MoneyResponseDto;
}

export class CartResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  customerId!: string;

  @ApiProperty({ type: [CartItemResponseDto] })
  items!: CartItemResponseDto[];

  @ApiProperty({ type: MoneyResponseDto })
  total!: MoneyResponseDto;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  updatedAt!: string;
}

export class OrderItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  productId!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  variantId!: string;

  @ApiProperty({ example: 'Classic T-Shirt' })
  productName!: string;

  @ApiProperty({ example: 'SKU-001' })
  sku!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ type: MoneyResponseDto })
  unitPrice!: MoneyResponseDto;

  @ApiProperty({ type: MoneyResponseDto })
  lineTotal!: MoneyResponseDto;
}

export class ShippingAddressResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  addressId!: string;

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
}

export class OrderResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  customerId!: string;

  @ApiProperty({ example: 'PENDING_PAYMENT' })
  status!: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty({ type: ShippingAddressResponseDto })
  shippingAddress!: ShippingAddressResponseDto;

  @ApiProperty({ type: MoneyResponseDto })
  total!: MoneyResponseDto;

  @ApiProperty({ example: 'stripe' })
  paymentProvider!: string;

  @ApiPropertyOptional({ example: 'pay_abc123' })
  paymentId?: string;

  @ApiPropertyOptional({
    example: 'https://checkout.stripe.com/pay/cs_test_abc',
  })
  paymentUrl?: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  updatedAt!: string;

  @ApiPropertyOptional({ example: '2026-01-15T11:00:00.000Z' })
  cancelledAt?: string;

  @ApiPropertyOptional({ example: '2026-01-15T10:30:00.000Z' })
  confirmedAt?: string;
}

export class CheckoutResponseDto {
  @ApiProperty({ type: OrderResponseDto })
  order!: OrderResponseDto;

  @ApiProperty({ example: 'https://checkout.stripe.com/pay/cs_test_abc' })
  paymentUrl!: string;

  @ApiProperty({ example: 'pay_abc123' })
  paymentId!: string;
}

export class ListOrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  orders!: OrderResponseDto[];

  @ApiProperty({ example: 5 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;
}
