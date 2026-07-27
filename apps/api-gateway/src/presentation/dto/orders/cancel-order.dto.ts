import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelOrderDto {
  @ApiPropertyOptional({
    example: 'Changed my mind',
    description: 'Reason for cancellation',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
