import type {
  AssetResponse,
  DeleteAssetRequest,
  DeleteAssetResponse,
  GetAssetRequest,
  PingResponse,
  PresignUploadRequest,
  PresignUploadResponse,
} from 'libs/shared/generated/media';
import { Observable } from 'rxjs';

export abstract class MediaClientPort {
  abstract ping(): Observable<PingResponse>;

  abstract presignUpload(
    request: PresignUploadRequest,
  ): Observable<PresignUploadResponse>;

  abstract deleteAsset(
    request: DeleteAssetRequest,
  ): Observable<DeleteAssetResponse>;

  abstract getAsset(request: GetAssetRequest): Observable<AssetResponse>;
}
