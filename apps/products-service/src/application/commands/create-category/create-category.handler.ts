import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CategoryDto } from 'apps/products-service/src/application/dto/category.dto';
import { Category } from 'apps/products-service/src/domain/entities/category.entity';
import { CategoryNotFoundException } from 'apps/products-service/src/domain/exceptions/category-not-found.exception';
import { DuplicateSlugException } from 'apps/products-service/src/domain/exceptions/duplicate-slug.exception';
import { CategoryRepository } from 'apps/products-service/src/domain/repositories/category.repository';
import { CategoryId } from 'apps/products-service/src/domain/value-objects/category/category-id.vo';
import { CategoryName } from 'apps/products-service/src/domain/value-objects/category/category-name.vo';
import { Slug } from 'apps/products-service/src/domain/value-objects/shared/slug.vo';
import { CreateCategoryCommand } from './create-category.command';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(command: CreateCategoryCommand): Promise<CategoryDto> {
    const slug = Slug.create(command.slug);

    if (await this.categories.existsBySlug(slug)) {
      throw new DuplicateSlugException(slug.value);
    }

    const name = CategoryName.create(command.name);
    let category: Category;

    if (command.parentId) {
      const parent = await this.categories.findById(
        CategoryId.restore(command.parentId),
      );

      if (!parent) {
        throw new CategoryNotFoundException(command.parentId);
      }

      category = Category.createChild(CategoryId.create(), name, slug, parent);
    } else {
      category = Category.createRoot(CategoryId.create(), name, slug);
    }

    await this.categories.save(category);

    return new CategoryDto(
      category.id.value,
      category.name.value,
      category.slug.value,
      category.path.value,
      category.parentId?.value ?? null,
      category.isActive,
      category.depth,
      category.createdAt,
      category.updatedAt,
    );
  }
}
