import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface CategoryNameProps {
  value: string;
}

export class CategoryName extends ValueObject<CategoryNameProps> {
  private static readonly MAX_LENGTH = 150;

  private constructor(props: CategoryNameProps) {
    super(props);
  }

  public static create(raw: string): CategoryName {
    const value = raw.trim().replace(/\s+/g, ' ');

    if (!value) {
      throw new DomainException('Category name is required.', {
        code: 'CATEGORY_NAME_REQUIRED',
      });
    }

    if (value.length > this.MAX_LENGTH) {
      throw new DomainException('Category name is too long.', {
        code: 'CATEGORY_NAME_TOO_LONG',
      });
    }

    return new CategoryName({ value });
  }

  public static restore(value: string): CategoryName {
    return new CategoryName({ value });
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
