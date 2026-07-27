import { MediaAsset } from '../entities/media-asset.entity';
import { MediaAssetId } from '../value-objects/media-asset-id.vo';

export abstract class MediaAssetRepository {
  abstract findById(id: MediaAssetId): Promise<MediaAsset | null>;
  abstract save(asset: MediaAsset): Promise<void>;
}
