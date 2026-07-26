import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ImageInputDto, VariantInputDto } from './shared.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Classic T-Shirt' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'classic-t-shirt' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'cat-uuid' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ example: 'A comfortable cotton t-shirt.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'brand-uuid' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ type: [VariantInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantInputDto)
  variants?: VariantInputDto[];

  @ApiPropertyOptional({ type: [ImageInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageInputDto)
  images?: ImageInputDto[];
}
