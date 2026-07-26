import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CategoryDto } from 'apps/products-service/src/application/dto/category.dto';
import { CategoryNotFoundException } from 'apps/products-service/src/domain/exceptions/category-not-found.exception';
import { CategoryRepository } from 'apps/products-service/src/domain/repositories/category.repository';
import { CategoryId } from 'apps/products-service/src/domain/value-objects/category/category-id.vo';
import { SetCategoryActiveCommand } from './set-category-active.command';

@CommandHandler(SetCategoryActiveCommand)
export class SetCategoryActiveHandler implements ICommandHandler<SetCategoryActiveCommand> {
  constructor(private readonly categories: CategoryRepository) {}

  async execute(command: SetCategoryActiveCommand): Promise<CategoryDto> {
    const category = await this.categories.findById(
      CategoryId.restore(command.categoryId),
    );

    if (!category) {
      throw new CategoryNotFoundException(command.categoryId);
    }

    if (command.isActive) {
      category.activate();
    } else {
      category.deactivate();
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
