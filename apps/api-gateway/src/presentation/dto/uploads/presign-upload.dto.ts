import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class PresignUploadDto {
  @ApiProperty({
    enum: ['product-image', 'avatar'],
    example: 'product-image',
  })
  @IsString()
  @IsIn(['product-image', 'avatar'])
  purpose!: 'product-image' | 'avatar';

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @MinLength(3)
  @MaxLength(128)
  contentType!: string;

  @ApiProperty({ example: 245760, description: 'File size in bytes' })
  @IsInt()
  @Min(1)
  @Max(5 * 1024 * 1024)
  contentLength!: number;

  @ApiPropertyOptional({ example: 'hero.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;
}
