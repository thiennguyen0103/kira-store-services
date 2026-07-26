import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({
    example: 10,
    description: 'Stock delta (positive or negative)',
  })
  @IsInt()
  delta!: number;
}
