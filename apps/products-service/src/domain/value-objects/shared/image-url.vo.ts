import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface ImageUrlProps {
  value: string;
}

export class ImageUrl extends ValueObject<ImageUrlProps> {
  private static readonly MAX_LENGTH = 2048;

  private constructor(props: ImageUrlProps) {
    super(props);
  }

  public static create(raw: string): ImageUrl {
    const value = raw.trim();

    if (!value) {
      throw new DomainException('Image URL is required.', {
        code: 'IMAGE_URL_REQUIRED',
      });
    }

    if (value.length > this.MAX_LENGTH) {
      throw new DomainException('Image URL is too long.', {
        code: 'IMAGE_URL_TOO_LONG',
      });
    }

    try {
      void new URL(value);
    } catch {
      throw new DomainException('Image URL is invalid.', {
        code: 'INVALID_IMAGE_URL',
      });
    }

    return new ImageUrl({ value });
  }

  public static restore(value: string): ImageUrl {
    return new ImageUrl({ value });
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
