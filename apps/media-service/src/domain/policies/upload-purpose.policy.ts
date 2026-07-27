import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { MediaPurpose } from '../enums/media-purpose.enum';

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MEDIA_PURPOSE_VALUES = new Set<string>(Object.values(MediaPurpose));

export interface PurposePolicy {
  maxBytes: number;
  allowedMimeTypes: ReadonlySet<string>;
}

const POLICIES: Record<MediaPurpose, PurposePolicy> = {
  [MediaPurpose.PRODUCT_IMAGE]: {
    maxBytes: 5 * 1024 * 1024,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  [MediaPurpose.AVATAR]: {
    maxBytes: 2 * 1024 * 1024,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
};

export function parseMediaPurpose(raw: string): MediaPurpose {
  const value = raw.trim().toLowerCase();
  if (MEDIA_PURPOSE_VALUES.has(value)) {
    return value as MediaPurpose;
  }
  throw new DomainException('Unsupported upload purpose.', {
    code: 'INVALID_UPLOAD_PURPOSE',
    details: { purpose: raw },
  });
}

export function getPurposePolicy(purpose: MediaPurpose): PurposePolicy {
  return POLICIES[purpose];
}

export function assertPurposeAllows(params: {
  purpose: MediaPurpose;
  contentType: string;
  contentLength: number;
}): void {
  const policy = getPurposePolicy(params.purpose);
  const contentType = params.contentType.trim().toLowerCase();

  if (!policy.allowedMimeTypes.has(contentType)) {
    throw new DomainException('Content type is not allowed for this purpose.', {
      code: 'INVALID_CONTENT_TYPE',
      details: {
        purpose: params.purpose,
        contentType: params.contentType,
      },
    });
  }

  if (
    !Number.isFinite(params.contentLength) ||
    params.contentLength <= 0 ||
    params.contentLength > policy.maxBytes
  ) {
    throw new DomainException('Content length exceeds the allowed limit.', {
      code: 'INVALID_CONTENT_LENGTH',
      details: {
        purpose: params.purpose,
        contentLength: params.contentLength,
        maxBytes: policy.maxBytes,
      },
    });
  }
}
