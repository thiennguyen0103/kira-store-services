import { Brand } from '../entities/brand.entity';
import { BrandId } from '../value-objects/brand/brand-id.vo';
import { Slug } from '../value-objects/shared/slug.vo';

export abstract class BrandRepository {
  abstract save(brand: Brand): Promise<void>;

  abstract findById(id: BrandId): Promise<Brand | null>;

  abstract findBySlug(slug: Slug): Promise<Brand | null>;

  abstract existsBySlug(slug: Slug): Promise<boolean>;
}
