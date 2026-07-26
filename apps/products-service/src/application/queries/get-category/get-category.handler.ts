import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CategoryNotFoundException } from 'apps/products-service/src/domain/exceptions/category-not-found.exception';
import { CategoryDto } from '../../dto/category.dto';
import { CategoryQueryRepository } from '../repositories/category-query.repository';
import { GetCategoryQuery } from './get-category.query';

@QueryHandler(GetCategoryQuery)
export class GetCategoryHandler implements IQueryHandler<GetCategoryQuery> {
  constructor(
    private readonly categoryQueryRepository: CategoryQueryRepository,
  ) {}

  async execute(query: GetCategoryQuery): Promise<CategoryDto> {
    const category = await this.categoryQueryRepository.findById(
      query.categoryId,
    );

    if (!category) {
      throw new CategoryNotFoundException(query.categoryId);
    }

    return category;
  }
}
