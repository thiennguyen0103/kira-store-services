import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({
    example: 'jane.doe@example.com',
    description: 'Account email address',
  })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({
    example: 'SecurePass1',
    description: 'Password (8–128 chars, at least one letter and one number)',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password!: string;

  @ApiProperty({ example: 'Jane', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;
}

export class LoginRequestDto {
  @ApiProperty({
    example: 'jane.doe@example.com',
    description: 'Account email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'SecurePass1',
    description: 'Account password',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshTokenRequestDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token to rotate',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class LogoutRequestDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token to revoke',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class VerifyEmailQueryDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Email verification token from the verification link',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class ForgotPasswordRequestDto {
  @ApiProperty({
    example: 'jane.doe@example.com',
    description: 'Account email address',
  })
  @IsEmail()
  email!: string;
}

export class ResetPasswordRequestDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Password reset token from the reset email',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    example: 'NewSecurePass1',
    description:
      'New password (8–128 chars, at least one letter and one number)',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  newPassword!: string;
}

export class ValidateTokenRequestDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access token to validate',
  })
  @IsString()
  @IsNotEmpty()
  accessToken!: string;
}
