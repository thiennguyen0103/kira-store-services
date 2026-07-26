import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  identityId!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;

  @ApiProperty({
    example: 900,
    description: 'Access token lifetime in seconds',
  })
  expiresIn!: number;
}

export class RegisterResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  identityId!: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  email!: string;

  @ApiProperty({ example: 'PENDING_VERIFICATION' })
  status!: string;

  @ApiProperty({
    example: 'Registration successful. Please verify your email.',
  })
  message!: string;
}

export class SuccessMessageResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'If the email exists, a reset link has been sent.' })
  message!: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;
}

export class ValidateTokenResponseDto {
  @ApiProperty({ example: true })
  valid!: boolean;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  identityId!: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  email!: string;

  @ApiProperty({ example: 'CUSTOMER' })
  role!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}
