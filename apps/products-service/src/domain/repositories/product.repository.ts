import { Product } from '../entities/product.entity';
import { ProductId } from '../value-objects/product/product-id.vo';
import { Sku } from '../value-objects/product/sku.vo';
import { Slug } from '../value-objects/shared/slug.vo';

export abstract class ProductRepository {
  abstract save(product: Product): Promise<void>;

  abstract findById(id: ProductId): Promise<Product | null>;

  abstract findBySlug(slug: Slug): Promise<Product | null>;

  abstract findBySku(sku: Sku): Promise<Product | null>;

  abstract existsBySlug(slug: Slug): Promise<boolean>;
}
