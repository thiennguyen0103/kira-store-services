import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID()
  addressId!: string;

  @ApiProperty({ example: 'PAYOS' })
  @IsString()
  paymentProvider!: string;
}
