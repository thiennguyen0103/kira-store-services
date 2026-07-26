import { Category } from '../entities/category.entity';
import { CategoryId } from '../value-objects/category/category-id.vo';
import { Slug } from '../value-objects/shared/slug.vo';

export abstract class CategoryRepository {
  abstract save(category: Category): Promise<void>;

  abstract findById(id: CategoryId): Promise<Category | null>;

  abstract findBySlug(slug: Slug): Promise<Category | null>;

  abstract findChildren(parentId: CategoryId): Promise<Category[]>;

  abstract existsBySlug(slug: Slug): Promise<boolean>;
}
