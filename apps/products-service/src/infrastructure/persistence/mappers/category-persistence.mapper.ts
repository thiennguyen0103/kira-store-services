import { Injectable } from '@nestjs/common';
import { CategoryDto } from 'apps/products-service/src/application/dto/category.dto';
import { Category } from 'apps/products-service/src/domain/entities/category.entity';
import { CategoryId } from 'apps/products-service/src/domain/value-objects/category/category-id.vo';
import { CategoryName } from 'apps/products-service/src/domain/value-objects/category/category-name.vo';
import { CategoryPath } from 'apps/products-service/src/domain/value-objects/category/category-path.vo';
import { Slug } from 'apps/products-service/src/domain/value-objects/shared/slug.vo';
import { CategoryOrmEntity } from '../entities/category.orm-entity';

@Injectable()
export class CategoryPersistenceMapper {
  toDto(category: CategoryOrmEntity): CategoryDto {
    return new CategoryDto(
      category.id,
      category.name,
      category.slug,
      category.path,
      category.parentId,
      category.isActive,
      category.depth,
      category.createdAt,
      category.updatedAt,
    );
  }

  toDomain(category: CategoryOrmEntity): Category {
    return Category.restore(CategoryId.restore(category.id), {
      name: CategoryName.restore(category.name),
      slug: Slug.restore(category.slug),
      path: CategoryPath.restore(category.path, category.depth),
      parentId: category.parentId
        ? CategoryId.restore(category.parentId)
        : undefined,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }

  toOrm(category: Category): CategoryOrmEntity {
    const orm = new CategoryOrmEntity();
    orm.id = category.id.value;
    orm.name = category.name.value;
    orm.slug = category.slug.value;
    orm.path = category.path.value;
    orm.depth = category.depth;
    orm.parentId = category.parentId?.value ?? null;
    orm.isActive = category.isActive;
    orm.createdAt = category.createdAt;
    orm.updatedAt = category.updatedAt;
    return orm;
  }
}
