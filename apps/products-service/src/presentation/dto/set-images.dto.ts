import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ImageInputDto } from './shared.dto';

export class SetImagesDto {
  @ApiProperty({ type: [ImageInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageInputDto)
  images!: ImageInputDto[];
}
