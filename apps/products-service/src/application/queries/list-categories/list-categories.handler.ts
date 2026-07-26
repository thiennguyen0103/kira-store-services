import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { CategoryDto } from '../../dto/category.dto';
import { CategoryQueryRepository } from '../repositories/category-query.repository';
import { ListCategoriesQuery } from './list-categories.query';

@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler implements IQueryHandler<
  ListCategoriesQuery,
  PagedResultDto<CategoryDto>
> {
  constructor(
    private readonly categoryQueryRepository: CategoryQueryRepository,
  ) {}

  async execute(
    query: ListCategoriesQuery,
  ): Promise<PagedResultDto<CategoryDto>> {
    return this.categoryQueryRepository.list(
      new PageRequestDto(query.page, query.limit),
      {
        activeOnly: query.activeOnly,
        parentId: query.parentId,
      },
    );
  }
}
