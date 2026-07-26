import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProductListItemDto } from 'apps/products-service/src/application/dto/product.dto';
import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { ProductQueryRepository } from '../repositories/product-query.repository';
import { ListProductsQuery } from './list-products.query';

@QueryHandler(ListProductsQuery)
export class ListProductsHandler implements IQueryHandler<
  ListProductsQuery,
  PagedResultDto<ProductListItemDto>
> {
  constructor(
    private readonly productQueryRepository: ProductQueryRepository,
  ) {}

  async execute(
    query: ListProductsQuery,
  ): Promise<PagedResultDto<ProductListItemDto>> {
    return this.productQueryRepository.list(
      new PageRequestDto(query.page, query.limit),
      {
        status: query.status,
        categoryId: query.categoryId,
        brandId: query.brandId,
        query: query.query,
      },
    );
  }
}
