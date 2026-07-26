import { AggregateRoot } from 'libs/shared/domain/aggregate-root';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { ProductStatus } from '../enums/product-status.enum';
import { ProductArchivedEvent } from '../events/product-archived.event';
import { ProductCreatedEvent } from '../events/product-created.event';
import { ProductPublishedEvent } from '../events/product-published.event';
import { ProductUpdatedEvent } from '../events/product-updated.event';
import { StockReleasedEvent } from '../events/stock-released.event';
import { StockReservationFailedEvent } from '../events/stock-reservation-failed.event';
import { StockReservedEvent } from '../events/stock-reserved.event';
import { VariantAddedEvent } from '../events/variant-added.event';
import { DuplicateSkuException } from '../exceptions/duplicate-sku.exception';
import { InsufficientStockException } from '../exceptions/insufficient-stock.exception';
import { ProductCannotPublishException } from '../exceptions/product-cannot-publish.exception';
import { VariantNotFoundException } from '../exceptions/variant-not-found.exception';
import { BrandId } from '../value-objects/brand/brand-id.vo';
import { CategoryId } from '../value-objects/category/category-id.vo';
import { ProductDescription } from '../value-objects/product/product-description.vo';
import { ProductId } from '../value-objects/product/product-id.vo';
import { ProductName } from '../value-objects/product/product-name.vo';
import { Sku } from '../value-objects/product/sku.vo';
import { VariantId } from '../value-objects/product/variant-id.vo';
import { Money } from '../value-objects/shared/money.vo';
import { Slug } from '../value-objects/shared/slug.vo';
import { VariantOptions } from '../value-objects/product/variant-options.vo';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';

export interface ProductProps {
  name: ProductName;
  slug: Slug;
  description?: ProductDescription;
  status: ProductStatus;
  categoryId: CategoryId;
  brandId?: BrandId;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends AggregateRoot<ProductId> {
  private constructor(
    id: ProductId,
    private props: ProductProps,
  ) {
    super(id);
  }

  public static create(
    id: ProductId,
    props: {
      name: ProductName;
      slug: Slug;
      categoryId: CategoryId;
      description?: ProductDescription;
      brandId?: BrandId;
      variants?: ProductVariant[];
      images?: ProductImage[];
    },
  ): Product {
    const now = new Date();
    const variants = props.variants ?? [];

    Product.assertUniqueSkus(variants);

    const product = new Product(id, {
      name: props.name,
      slug: props.slug,
      description: props.description,
      status: ProductStatus.DRAFT,
      categoryId: props.categoryId,
      brandId: props.brandId,
      variants,
      images: props.images ?? [],
      createdAt: now,
      updatedAt: now,
    });

    product.addDomainEvent(new ProductCreatedEvent(product.id));

    return product;
  }

  public static restore(id: ProductId, props: ProductProps): Product {
    return new Product(id, props);
  }

  get name(): ProductName {
    return this.props.name;
  }

  get slug(): Slug {
    return this.props.slug;
  }

  get description(): ProductDescription | undefined {
    return this.props.description;
  }

  get status(): ProductStatus {
    return this.props.status;
  }

  get categoryId(): CategoryId {
    return this.props.categoryId;
  }

  get brandId(): BrandId | undefined {
    return this.props.brandId;
  }

  get variants(): readonly ProductVariant[] {
    return this.props.variants;
  }

  get images(): readonly ProductImage[] {
    return this.props.images;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateDetails(props: {
    name?: ProductName;
    slug?: Slug;
    description?: ProductDescription | null;
    categoryId?: CategoryId;
    brandId?: BrandId | null;
  }): void {
    this.assertNotArchived();

    if (props.name !== undefined) {
      this.props.name = props.name;
    }
    if (props.slug !== undefined) {
      this.props.slug = props.slug;
    }
    if (props.description !== undefined) {
      this.props.description = props.description ?? undefined;
    }
    if (props.categoryId !== undefined) {
      this.props.categoryId = props.categoryId;
    }
    if (props.brandId !== undefined) {
      this.props.brandId = props.brandId ?? undefined;
    }

    this.touch();
    this.addDomainEvent(new ProductUpdatedEvent(this.id));
  }

  public publish(): void {
    this.assertNotArchived();

    if (this.props.variants.length === 0) {
      throw new ProductCannotPublishException(
        'Product must have at least one variant before publishing.',
      );
    }

    if (!this.props.variants.some((v) => v.isActive)) {
      throw new ProductCannotPublishException(
        'Product must have at least one active variant before publishing.',
      );
    }

    this.props.status = ProductStatus.ACTIVE;
    this.touch();
    this.addDomainEvent(new ProductPublishedEvent(this.id));
  }

  public archive(): void {
    if (this.props.status === ProductStatus.ARCHIVED) {
      return;
    }

    this.props.status = ProductStatus.ARCHIVED;
    this.touch();
    this.addDomainEvent(new ProductArchivedEvent(this.id));
  }

  public addVariant(variant: ProductVariant): void {
    this.assertNotArchived();
    this.assertSkuAvailable(variant.sku);

    this.props.variants.push(variant);
    this.touch();
    this.addDomainEvent(
      new VariantAddedEvent(this.id, variant.id, variant.sku),
    );
  }

  public updateVariant(
    variantId: VariantId,
    props: {
      options?: VariantOptions;
      price?: Money;
      barcode?: string | null;
      isActive?: boolean;
    },
  ): void {
    this.assertNotArchived();

    const variant = this.requireVariant(variantId);
    variant.update(props);
    this.touch();
    this.addDomainEvent(new ProductUpdatedEvent(this.id));
  }

  public removeVariant(variantId: VariantId): void {
    this.assertNotArchived();

    const index = this.props.variants.findIndex((v) => v.id.equals(variantId));

    if (index === -1) {
      throw new VariantNotFoundException(variantId.value);
    }

    this.props.variants.splice(index, 1);
    this.touch();
    this.addDomainEvent(new ProductUpdatedEvent(this.id));
  }

  public setImages(images: ProductImage[]): void {
    this.assertNotArchived();

    const primaryCount = images.filter((img) => img.isPrimary).length;

    if (images.length > 0 && primaryCount === 0) {
      images[0].markPrimary();
    }

    if (primaryCount > 1) {
      let seenPrimary = false;
      for (const image of images) {
        if (image.isPrimary) {
          if (seenPrimary) {
            image.clearPrimary();
          } else {
            seenPrimary = true;
          }
        }
      }
    }

    this.props.images = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
    this.touch();
    this.addDomainEvent(new ProductUpdatedEvent(this.id));
  }

  public reserveStock(variantId: VariantId, qty: number): void {
    const variant = this.requireVariant(variantId);

    try {
      variant.setStock(variant.stock.reserve(qty));
      this.touch();
      this.addDomainEvent(new StockReservedEvent(this.id, variantId, qty));
    } catch (error) {
      if (error instanceof InsufficientStockException) {
        this.addDomainEvent(
          new StockReservationFailedEvent(
            this.id,
            variantId,
            qty,
            variant.stock.available,
          ),
        );
      }
      throw error;
    }
  }

  public releaseStock(variantId: VariantId, qty: number): void {
    const variant = this.requireVariant(variantId);
    variant.setStock(variant.stock.release(qty));
    this.touch();
    this.addDomainEvent(new StockReleasedEvent(this.id, variantId, qty));
  }

  public adjustVariantStock(variantId: VariantId, delta: number): void {
    this.assertNotArchived();

    const variant = this.requireVariant(variantId);
    variant.setStock(variant.stock.adjustOnHand(delta));
    this.touch();
    this.addDomainEvent(new ProductUpdatedEvent(this.id));
  }

  public findVariantBySku(sku: Sku): ProductVariant | undefined {
    return this.props.variants.find((v) => v.sku.equals(sku));
  }

  private requireVariant(variantId: VariantId): ProductVariant {
    const variant = this.props.variants.find((v) => v.id.equals(variantId));

    if (!variant) {
      throw new VariantNotFoundException(variantId.value);
    }

    return variant;
  }

  private assertSkuAvailable(sku: Sku): void {
    if (this.props.variants.some((v) => v.sku.equals(sku))) {
      throw new DuplicateSkuException(sku.value);
    }
  }

  private static assertUniqueSkus(variants: ProductVariant[]): void {
    const seen = new Set<string>();

    for (const variant of variants) {
      const key = variant.sku.value;
      if (seen.has(key)) {
        throw new DuplicateSkuException(key);
      }
      seen.add(key);
    }
  }

  private assertNotArchived(): void {
    if (this.props.status === ProductStatus.ARCHIVED) {
      throw new DomainException('Archived products cannot be modified.', {
        code: 'PRODUCT_ARCHIVED',
      });
    }
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
