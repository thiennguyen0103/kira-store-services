import { AggregateRoot } from 'libs/shared/domain/aggregate-root';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { MediaAssetStatus } from '../enums/media-asset-status.enum';
import { MediaPurpose } from '../enums/media-purpose.enum';
import { MediaAssetId } from '../value-objects/media-asset-id.vo';

export interface MediaAssetProps {
  key: string;
  purpose: MediaPurpose;
  contentType: string;
  contentLength: number;
  publicUrl: string;
  uploaderIdentityId: string;
  status: MediaAssetStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class MediaAsset extends AggregateRoot<MediaAssetId> {
  private constructor(
    id: MediaAssetId,
    private props: MediaAssetProps,
  ) {
    super(id);
  }

  public static createPending(params: {
    id: MediaAssetId;
    key: string;
    purpose: MediaPurpose;
    contentType: string;
    contentLength: number;
    publicUrl: string;
    uploaderIdentityId: string;
  }): MediaAsset {
    const now = new Date();
    return new MediaAsset(params.id, {
      key: params.key,
      purpose: params.purpose,
      contentType: params.contentType,
      contentLength: params.contentLength,
      publicUrl: params.publicUrl,
      uploaderIdentityId: params.uploaderIdentityId,
      status: MediaAssetStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static restore(id: MediaAssetId, props: MediaAssetProps): MediaAsset {
    return new MediaAsset(id, props);
  }

  get key(): string {
    return this.props.key;
  }

  get purpose(): MediaPurpose {
    return this.props.purpose;
  }

  get contentType(): string {
    return this.props.contentType;
  }

  get contentLength(): number {
    return this.props.contentLength;
  }

  get publicUrl(): string {
    return this.props.publicUrl;
  }

  get uploaderIdentityId(): string {
    return this.props.uploaderIdentityId;
  }

  get status(): MediaAssetStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public assertOwnedBy(identityId: string): void {
    if (this.props.uploaderIdentityId !== identityId) {
      throw new DomainException('You do not own this media asset.', {
        code: 'MEDIA_ASSET_FORBIDDEN',
      });
    }
  }

  public markDeleted(): void {
    if (this.props.status === MediaAssetStatus.DELETED) {
      return;
    }
    this.props.status = MediaAssetStatus.DELETED;
    this.props.updatedAt = new Date();
  }

  public markUploaded(): void {
    if (this.props.status === MediaAssetStatus.DELETED) {
      throw new DomainException(
        'Deleted media assets cannot be marked uploaded.',
        {
          code: 'MEDIA_ASSET_DELETED',
        },
      );
    }
    this.props.status = MediaAssetStatus.UPLOADED;
    this.props.updatedAt = new Date();
  }
}
