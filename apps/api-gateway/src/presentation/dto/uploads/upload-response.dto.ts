import { ApiProperty } from '@nestjs/swagger';

export class PresignUploadResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  assetId!: string;

  @ApiProperty({ example: 'uploads/avatar/a1b2c3d4.jpg' })
  key!: string;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/uploads/...?X-Amz-Signature=...',
  })
  uploadUrl!: string;

  @ApiProperty({
    example: 'https://cdn.example.com/uploads/avatar/a1b2c3d4.jpg',
  })
  publicUrl!: string;

  @ApiProperty({ example: '2026-01-15T10:15:00.000Z' })
  expiresAt!: string;
}

export class DeleteAssetResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;
}
