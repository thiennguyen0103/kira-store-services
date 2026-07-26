import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface SlugProps {
  value: string;
}

export class Slug extends ValueObject<SlugProps> {
  private static readonly MAX_LENGTH = 200;
  private static readonly PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  private constructor(props: SlugProps) {
    super(props);
  }

  public static create(raw: string): Slug {
    const value = raw.trim().toLowerCase();

    if (!value) {
      throw new DomainException('Slug is required.', {
        code: 'SLUG_REQUIRED',
      });
    }

    if (value.length > this.MAX_LENGTH) {
      throw new DomainException('Slug is too long.', {
        code: 'SLUG_TOO_LONG',
      });
    }

    if (!this.PATTERN.test(value)) {
      throw new DomainException(
        'Slug must be lowercase alphanumeric with hyphens.',
        { code: 'INVALID_SLUG' },
      );
    }

    return new Slug({ value });
  }

  public static restore(value: string): Slug {
    return new Slug({ value });
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
