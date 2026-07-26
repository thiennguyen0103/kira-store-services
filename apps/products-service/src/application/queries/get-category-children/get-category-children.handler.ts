import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CategoryNotFoundException } from 'apps/products-service/src/domain/exceptions/category-not-found.exception';
import { CategoryDto } from '../../dto/category.dto';
import { CategoryQueryRepository } from '../repositories/category-query.repository';
import { GetCategoryChildrenQuery } from './get-category-children.query';

@QueryHandler(GetCategoryChildrenQuery)
export class GetCategoryChildrenHandler implements IQueryHandler<
  GetCategoryChildrenQuery,
  CategoryDto[]
> {
  constructor(
    private readonly categoryQueryRepository: CategoryQueryRepository,
  ) {}

  async execute(query: GetCategoryChildrenQuery): Promise<CategoryDto[]> {
    const parent = await this.categoryQueryRepository.findById(query.parentId);

    if (!parent) {
      throw new CategoryNotFoundException(query.parentId);
    }

    return this.categoryQueryRepository.findChildren(query.parentId);
  }
}
