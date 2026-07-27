import { Injectable } from '@nestjs/common';
import { MediaAsset } from '../../../domain/entities/media-asset.entity';
import { MediaAssetStatus } from '../../../domain/enums/media-asset-status.enum';
import { MediaPurpose } from '../../../domain/enums/media-purpose.enum';
import { MediaAssetId } from '../../../domain/value-objects/media-asset-id.vo';
import { MediaAssetOrmEntity } from '../entities/media-asset.orm-entity';

@Injectable()
export class MediaAssetPersistenceMapper {
  toDomain(orm: MediaAssetOrmEntity): MediaAsset {
    return MediaAsset.restore(MediaAssetId.restore(orm.id), {
      key: orm.key,
      purpose: orm.purpose as MediaPurpose,
      contentType: orm.contentType,
      contentLength: Number(orm.contentLength),
      publicUrl: orm.publicUrl,
      uploaderIdentityId: orm.uploaderIdentityId,
      status: orm.status as MediaAssetStatus,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  toOrm(asset: MediaAsset): MediaAssetOrmEntity {
    const orm = new MediaAssetOrmEntity();
    orm.id = asset.id.value;
    orm.key = asset.key;
    orm.purpose = asset.purpose;
    orm.contentType = asset.contentType;
    orm.contentLength = String(asset.contentLength);
    orm.publicUrl = asset.publicUrl;
    orm.uploaderIdentityId = asset.uploaderIdentityId;
    orm.status = asset.status;
    orm.createdAt = asset.createdAt;
    orm.updatedAt = asset.updatedAt;
    return orm;
  }
}
