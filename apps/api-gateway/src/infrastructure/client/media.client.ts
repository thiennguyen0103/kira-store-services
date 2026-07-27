import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
import type {
  AssetResponse,
  DeleteAssetRequest,
  DeleteAssetResponse,
  GetAssetRequest,
  MediaServiceClient,
  PingResponse,
  PresignUploadRequest,
  PresignUploadResponse,
} from 'libs/shared/generated/media';
import { MediaClientPort } from '../../application/ports/media-client.port';

@Injectable()
export class MediaClient extends MediaClientPort implements OnModuleInit {
  private mediaService!: MediaServiceClient;

  constructor(
    @Inject(SERVICE_TOKENS.MEDIA_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.mediaService = this.client.getService<MediaServiceClient>(
      GRPC_SERVICE_NAMES.MEDIA,
    );
  }

  ping(): Observable<PingResponse> {
    return this.mediaService.ping({});
  }

  presignUpload(
    request: PresignUploadRequest,
  ): Observable<PresignUploadResponse> {
    return this.mediaService.presignUpload(request);
  }

  deleteAsset(request: DeleteAssetRequest): Observable<DeleteAssetResponse> {
    return this.mediaService.deleteAsset(request);
  }

  getAsset(request: GetAssetRequest): Observable<AssetResponse> {
    return this.mediaService.getAsset(request);
  }
}
