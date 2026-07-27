import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentProvider } from 'libs/shared/enums';

export class CheckoutDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsString()
  @IsNotEmpty()
  addressId!: string;

  @ApiProperty({
    enum: PaymentProvider,
    example: PaymentProvider.PAYOS,
    description: 'Payment provider (PAYOS or STRIPE)',
  })
  @IsEnum(PaymentProvider)
  paymentProvider!: PaymentProvider;
}
