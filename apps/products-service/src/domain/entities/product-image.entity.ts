import { Entity } from 'libs/shared/domain/entity';
import { ImageId } from '../value-objects/product/image-id.vo';
import { ImageUrl } from '../value-objects/shared/image-url.vo';

export interface ProductImageProps {
  url: ImageUrl;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export class ProductImage extends Entity<ImageId> {
  private constructor(
    id: ImageId,
    private props: ProductImageProps,
  ) {
    super(id);
  }

  public static create(
    id: ImageId,
    props: Omit<ProductImageProps, 'isPrimary' | 'sortOrder'> & {
      sortOrder?: number;
      isPrimary?: boolean;
    },
  ): ProductImage {
    return new ProductImage(id, {
      url: props.url,
      alt: props.alt,
      sortOrder: props.sortOrder ?? 0,
      isPrimary: props.isPrimary ?? false,
    });
  }

  public static restore(id: ImageId, props: ProductImageProps): ProductImage {
    return new ProductImage(id, props);
  }

  get url(): ImageUrl {
    return this.props.url;
  }

  get alt(): string | undefined {
    return this.props.alt;
  }

  get sortOrder(): number {
    return this.props.sortOrder;
  }

  get isPrimary(): boolean {
    return this.props.isPrimary;
  }

  public markPrimary(): void {
    this.props.isPrimary = true;
  }

  public clearPrimary(): void {
    this.props.isPrimary = false;
  }

  public setSortOrder(sortOrder: number): void {
    this.props.sortOrder = sortOrder;
  }
}
