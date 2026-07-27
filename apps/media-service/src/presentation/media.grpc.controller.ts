import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { GRPC_SERVICE_NAMES } from 'libs/shared/constants';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import type {
  AssetResponse,
  DeleteAssetRequest,
  DeleteAssetResponse,
  GetAssetRequest,
  PingRequest,
  PingResponse,
  PresignUploadRequest,
  PresignUploadResponse,
} from 'libs/shared/generated/media';
import { DeleteAssetCommand } from '../application/commands/delete-asset/delete-asset.command';
import {
  PresignUploadCommand,
  type PresignUploadResult,
} from '../application/commands/presign-upload/presign-upload.command';
import {
  type AssetResult,
  GetAssetQuery,
} from '../application/queries/get-asset/get-asset.query';

@Controller()
export class MediaGrpcController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod(GRPC_SERVICE_NAMES.MEDIA, 'Ping')
  ping(_data: PingRequest): PingResponse {
    return { ok: true, service: 'media-service' };
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.MEDIA, 'PresignUpload')
  async presignUpload(
    data: PresignUploadRequest,
  ): Promise<PresignUploadResponse> {
    return this.execute(() =>
      this.commandBus.execute<PresignUploadCommand, PresignUploadResult>(
        new PresignUploadCommand(
          data.purpose,
          data.contentType,
          Number(data.contentLength),
          data.uploaderIdentityId,
          data.fileName || undefined,
        ),
      ),
    );
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.MEDIA, 'DeleteAsset')
  async deleteAsset(data: DeleteAssetRequest): Promise<DeleteAssetResponse> {
    return this.execute(() =>
      this.commandBus.execute<DeleteAssetCommand, { success: boolean }>(
        new DeleteAssetCommand(data.assetId, data.requesterIdentityId),
      ),
    );
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.MEDIA, 'GetAsset')
  async getAsset(data: GetAssetRequest): Promise<AssetResponse> {
    const result = await this.execute(() =>
      this.queryBus.execute<GetAssetQuery, AssetResult>(
        new GetAssetQuery(data.assetId),
      ),
    );
    return {
      assetId: result.assetId,
      key: result.key,
      purpose: result.purpose,
      contentType: result.contentType,
      contentLength: result.contentLength,
      publicUrl: result.publicUrl,
      status: result.status,
      uploaderIdentityId: result.uploaderIdentityId,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  private async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw this.toRpcException(error);
    }
  }

  private toRpcException(error: unknown): RpcException {
    if (error instanceof DomainException) {
      return new RpcException({
        code: this.mapGrpcCode(error.code),
        message: error.message,
      });
    }

    if (error instanceof Error) {
      return new RpcException({
        code: GrpcStatus.INTERNAL,
        message: error.message,
      });
    }

    return new RpcException({
      code: GrpcStatus.INTERNAL,
      message: 'Internal error',
    });
  }

  private mapGrpcCode(code: string): GrpcStatus {
    switch (code) {
      case 'MEDIA_ASSET_NOT_FOUND':
        return GrpcStatus.NOT_FOUND;
      case 'MEDIA_ASSET_FORBIDDEN':
        return GrpcStatus.PERMISSION_DENIED;
      case 'MEDIA_ASSET_DELETED':
        return GrpcStatus.FAILED_PRECONDITION;
      default:
        return GrpcStatus.INVALID_ARGUMENT;
    }
  }
}
