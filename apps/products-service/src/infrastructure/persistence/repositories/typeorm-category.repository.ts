import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'apps/products-service/src/domain/entities/category.entity';
import { CategoryRepository } from 'apps/products-service/src/domain/repositories/category.repository';
import { CategoryId } from 'apps/products-service/src/domain/value-objects/category/category-id.vo';
import { Slug } from 'apps/products-service/src/domain/value-objects/shared/slug.vo';
import { Repository } from 'typeorm';
import { CategoryOrmEntity } from '../entities/category.orm-entity';
import { CategoryPersistenceMapper } from '../mappers/category-persistence.mapper';

@Injectable()
export class TypeOrmCategoryRepository extends CategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly categories: Repository<CategoryOrmEntity>,
    private readonly mapper: CategoryPersistenceMapper,
  ) {
    super();
  }

  async save(category: Category): Promise<void> {
    await this.categories.save(this.mapper.toOrm(category));
  }

  async findById(id: CategoryId): Promise<Category | null> {
    const category = await this.categories.findOne({
      where: { id: id.value },
    });
    return category ? this.mapper.toDomain(category) : null;
  }

  async findBySlug(slug: Slug): Promise<Category | null> {
    const category = await this.categories.findOne({
      where: { slug: slug.value },
    });
    return category ? this.mapper.toDomain(category) : null;
  }

  async findChildren(parentId: CategoryId): Promise<Category[]> {
    const children = await this.categories.find({
      where: { parentId: parentId.value },
      order: { name: 'ASC' },
    });
    return children.map((child) => this.mapper.toDomain(child));
  }

  async existsBySlug(slug: Slug): Promise<boolean> {
    return this.categories.existsBy({ slug: slug.value });
  }
}
