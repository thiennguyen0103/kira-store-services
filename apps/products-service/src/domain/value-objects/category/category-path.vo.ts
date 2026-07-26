import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface CategoryPathProps {
  value: string;
  depth: number;
}

/**
 * Materialized path for category hierarchy, e.g. `/electronics/phones`.
 * Root categories use `/` + slug segment.
 */
export class CategoryPath extends ValueObject<CategoryPathProps> {
  private static readonly MAX_DEPTH = 10;
  private static readonly MAX_LENGTH = 1000;
  private static readonly PATTERN =
    /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

  private constructor(props: CategoryPathProps) {
    super(props);
  }

  public static create(value: string): CategoryPath {
    const normalized = value.trim();

    if (!this.PATTERN.test(normalized)) {
      throw new DomainException('Invalid category path.', {
        code: 'INVALID_CATEGORY_PATH',
      });
    }

    if (normalized.length > this.MAX_LENGTH) {
      throw new DomainException('Category path is too long.', {
        code: 'CATEGORY_PATH_TOO_LONG',
      });
    }

    const depth = normalized.split('/').filter(Boolean).length;

    if (depth > this.MAX_DEPTH) {
      throw new DomainException('Category hierarchy is too deep.', {
        code: 'CATEGORY_DEPTH_EXCEEDED',
        details: { depth, max: this.MAX_DEPTH },
      });
    }

    return new CategoryPath({ value: normalized, depth });
  }

  public static forRoot(slug: string): CategoryPath {
    return CategoryPath.create(`/${slug}`);
  }

  public static childOf(parent: CategoryPath, childSlug: string): CategoryPath {
    return CategoryPath.create(`${parent.value}/${childSlug}`);
  }

  public static restore(value: string, depth: number): CategoryPath {
    return new CategoryPath({ value, depth });
  }

  public get value(): string {
    return this.props.value;
  }

  public get depth(): number {
    return this.props.depth;
  }

  public toString(): string {
    return this.props.value;
  }
}
