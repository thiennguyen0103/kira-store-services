import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MediaAsset } from 'apps/media-service/src/domain/entities/media-asset.entity';
import {
  assertPurposeAllows,
  parseMediaPurpose,
} from 'apps/media-service/src/domain/policies/upload-purpose.policy';
import { MediaAssetRepository } from 'apps/media-service/src/domain/repositories/media-asset.repository';
import { MediaAssetId } from 'apps/media-service/src/domain/value-objects/media-asset-id.vo';
import { StoragePort } from '../../ports/storage.port';
import {
  PresignUploadCommand,
  PresignUploadResult,
} from './presign-upload.command';

@CommandHandler(PresignUploadCommand)
export class PresignUploadHandler implements ICommandHandler<PresignUploadCommand> {
  constructor(
    private readonly storage: StoragePort,
    private readonly assets: MediaAssetRepository,
  ) {}

  async execute(command: PresignUploadCommand): Promise<PresignUploadResult> {
    const purpose = parseMediaPurpose(command.purpose);
    const contentType = command.contentType.trim().toLowerCase();
    assertPurposeAllows({
      purpose,
      contentType,
      contentLength: Number(command.contentLength),
    });

    const assetId = MediaAssetId.create();
    const key = buildObjectKey({
      purpose,
      assetId: assetId.value,
      fileName: command.fileName,
      contentType,
    });

    const signed = await this.storage.createPresignedUpload({
      key,
      contentType,
      contentLength: Number(command.contentLength),
    });

    const asset = MediaAsset.createPending({
      id: assetId,
      key,
      purpose,
      contentType,
      contentLength: Number(command.contentLength),
      publicUrl: signed.publicUrl,
      uploaderIdentityId: command.uploaderIdentityId,
    });
    await this.assets.save(asset);

    return {
      assetId: assetId.value,
      key,
      uploadUrl: signed.uploadUrl,
      publicUrl: signed.publicUrl,
      expiresAt: signed.expiresAt.toISOString(),
    };
  }
}

function buildObjectKey(params: {
  purpose: string;
  assetId: string;
  fileName?: string;
  contentType: string;
}): string {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const safeName = sanitizeFileName(params.fileName, params.contentType);
  return `${params.purpose}/${yyyy}/${mm}/${params.assetId}-${safeName}`;
}

function sanitizeFileName(
  fileName: string | undefined,
  contentType: string,
): string {
  const fallbackExt =
    contentType === 'image/png'
      ? 'png'
      : contentType === 'image/webp'
        ? 'webp'
        : 'jpg';
  const raw = (fileName ?? `upload.${fallbackExt}`).trim().toLowerCase();
  const base = raw.replace(/[^a-z0-9._-]+/g, '-').replace(/-+/g, '-');
  const cleaned = base.replace(/^\.+/, '').slice(0, 80);
  return cleaned || `upload.${fallbackExt}`;
}
