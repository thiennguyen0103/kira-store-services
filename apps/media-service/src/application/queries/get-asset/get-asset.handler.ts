import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { MediaAssetRepository } from 'apps/media-service/src/domain/repositories/media-asset.repository';
import { MediaAssetId } from 'apps/media-service/src/domain/value-objects/media-asset-id.vo';
import { AssetResult, GetAssetQuery } from './get-asset.query';

@QueryHandler(GetAssetQuery)
export class GetAssetHandler implements IQueryHandler<GetAssetQuery> {
  constructor(private readonly assets: MediaAssetRepository) {}

  async execute(query: GetAssetQuery): Promise<AssetResult> {
    const asset = await this.assets.findById(
      MediaAssetId.restore(query.assetId),
    );
    if (!asset) {
      throw new DomainException('Media asset not found.', {
        code: 'MEDIA_ASSET_NOT_FOUND',
      });
    }

    return {
      assetId: asset.id.value,
      key: asset.key,
      purpose: asset.purpose,
      contentType: asset.contentType,
      contentLength: asset.contentLength,
      publicUrl: asset.publicUrl,
      status: asset.status,
      uploaderIdentityId: asset.uploaderIdentityId,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    };
  }
}
