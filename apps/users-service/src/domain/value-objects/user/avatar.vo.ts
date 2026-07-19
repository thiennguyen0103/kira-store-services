import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

interface AvatarProps {
  url: string;
}

export class Avatar extends ValueObject<AvatarProps> {
  constructor(props: AvatarProps) {
    super(props);
  }

  public static create(url: string): Avatar {
    if (!url) {
      throw new DomainException('Avatar URL is required.');
    }

    const normalized = url.trim();

    Avatar.validate(normalized);

    return new Avatar({
      url: normalized,
    });
  }

  public get url(): string {
    return this.props.url;
  }

  public get fileName(): string {
    try {
      const pathname = new URL(this.props.url).pathname;

      return pathname.split('/').pop() ?? '';
    } catch {
      return '';
    }
  }

  public get extension(): string {
    const file = this.fileName;

    return file.includes('.')
      ? file.substring(file.lastIndexOf('.') + 1).toLowerCase()
      : '';
  }

  // TODO: Add a default avatar
  public isDefault(): boolean {
    return this.props.url.includes('/defaults/avatar');
  }

  public withUrl(url: string): Avatar {
    return Avatar.create(url);
  }

  private static validate(url: string): void {
    let parsed: URL;

    try {
      parsed = new URL(url);
    } catch {
      throw new DomainException('Avatar URL is invalid.');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new DomainException('Avatar URL must use HTTP or HTTPS.');
    }

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];

    const extension = parsed.pathname.split('.').pop()?.toLowerCase() ?? '';

    if (!allowedExtensions.includes(extension)) {
      throw new DomainException(`Unsupported avatar extension: ${extension}`);
    }

    if (url.length > 2048) {
      throw new DomainException('Avatar URL exceeds maximum length.');
    }
  }
}
