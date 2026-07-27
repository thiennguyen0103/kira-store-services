import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({ example: '+84901234567' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'FEMALE', enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: '1995-06-15' })
  @IsOptional()
  @IsDateString()
  birthday?: string;
}

export class UpdateAvatarDto {
  @ApiProperty({ example: 'https://cdn.example.com/avatars/jane.png' })
  @IsUrl()
  @MaxLength(2048)
  avatarUrl!: string;
}

export class UpsertAddressDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: '+84901234567' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  phoneNumber!: string;

  @ApiProperty({ example: '79' })
  @IsString()
  @IsNotEmpty()
  provinceCode!: string;

  @ApiProperty({ example: '760' })
  @IsString()
  @IsNotEmpty()
  districtCode!: string;

  @ApiPropertyOptional({ example: 'District 1' })
  @IsOptional()
  @IsString()
  districtName?: string;

  @ApiProperty({ example: '26734' })
  @IsString()
  @IsNotEmpty()
  wardCode!: string;

  @ApiProperty({ example: '123 Nguyen Hue' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  addressLine!: string;

  @ApiPropertyOptional({ example: '700000' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  postalCode?: string;

  @ApiProperty({ example: 'HOME', enum: ['HOME', 'OFFICE', 'OTHER'] })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
