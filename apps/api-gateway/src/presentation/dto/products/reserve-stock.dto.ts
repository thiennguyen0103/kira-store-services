import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { StockItemDto } from './shared.dto';

export class ReserveStockDto {
  @ApiPropertyOptional({ example: 'order-uuid' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiProperty({ type: [StockItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockItemDto)
  items!: StockItemDto[];
}

export class ReleaseStockDto {
  @ApiPropertyOptional({ example: 'order-uuid' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiProperty({ type: [StockItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockItemDto)
  items!: StockItemDto[];
}
