import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { MediaAssetStatus } from 'apps/media-service/src/domain/enums/media-asset-status.enum';
import { MediaAssetRepository } from 'apps/media-service/src/domain/repositories/media-asset.repository';
import { MediaAssetId } from 'apps/media-service/src/domain/value-objects/media-asset-id.vo';
import { StoragePort } from '../../ports/storage.port';
import { DeleteAssetCommand } from './delete-asset.command';

@CommandHandler(DeleteAssetCommand)
export class DeleteAssetHandler implements ICommandHandler<DeleteAssetCommand> {
  constructor(
    private readonly storage: StoragePort,
    private readonly assets: MediaAssetRepository,
  ) {}

  async execute(command: DeleteAssetCommand): Promise<{ success: boolean }> {
    const asset = await this.assets.findById(
      MediaAssetId.restore(command.assetId),
    );
    if (!asset) {
      throw new DomainException('Media asset not found.', {
        code: 'MEDIA_ASSET_NOT_FOUND',
      });
    }

    asset.assertOwnedBy(command.requesterIdentityId);

    if (asset.status !== MediaAssetStatus.DELETED) {
      await this.storage.deleteObject(asset.key);
      asset.markDeleted();
      await this.assets.save(asset);
    }

    return { success: true };
  }
}
