import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { UserRole } from 'libs/shared/enums/user-role.enum';
import type {
  DeleteAssetResponse,
  PresignUploadResponse,
} from 'libs/shared/generated/media';
import { MediaClientPort } from '../application/ports/media-client.port';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './guards/auth.guard';
import { PresignUploadDto } from './dto/uploads/presign-upload.dto';
import {
  DeleteAssetResponseDto,
  PresignUploadResponseDto,
} from './dto/uploads/upload-response.dto';
import { callGrpc } from './helpers/call-grpc.helper';

@ApiTags('uploads')
@ApiBearerAuth('access-token')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly mediaClient: MediaClientPort) {}

  @Post('presign')
  @ApiOperation({
    summary: 'Get a presigned URL to upload a file directly to object storage',
  })
  @ApiBody({ type: PresignUploadDto })
  @ApiOkResponse({
    type: PresignUploadResponseDto,
    description: 'Presigned upload details',
  })
  presign(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: PresignUploadDto,
  ): Promise<PresignUploadResponse> {
    if (
      body.purpose === 'product-image' &&
      (user.role as UserRole) !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Only admins can upload product images');
    }

    return callGrpc(() =>
      firstValueFrom(
        this.mediaClient.presignUpload({
          purpose: body.purpose,
          contentType: body.contentType,
          contentLength: body.contentLength,
          fileName: body.fileName ?? '',
          uploaderIdentityId: user.identityId,
        }),
      ),
    );
  }

  @Delete(':assetId')
  @ApiOperation({ summary: 'Delete an uploaded media asset' })
  @ApiParam({ name: 'assetId', description: 'Media asset id' })
  @ApiOkResponse({ type: DeleteAssetResponseDto, description: 'Delete result' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('assetId') assetId: string,
  ): Promise<DeleteAssetResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.mediaClient.deleteAsset({
          assetId,
          requesterIdentityId: user.identityId,
        }),
      ),
    );
  }
}
