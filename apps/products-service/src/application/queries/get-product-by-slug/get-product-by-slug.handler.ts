import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ProductDetailDto } from 'apps/products-service/src/application/dto/product.dto';
import { ProductNotFoundException } from 'apps/products-service/src/domain/exceptions/product-not-found.exception';
import { ProductQueryRepository } from '../repositories/product-query.repository';
import { GetProductBySlugQuery } from './get-product-by-slug.query';

@QueryHandler(GetProductBySlugQuery)
export class GetProductBySlugHandler implements IQueryHandler<GetProductBySlugQuery> {
  constructor(
    private readonly productQueryRepository: ProductQueryRepository,
  ) {}

  async execute(query: GetProductBySlugQuery): Promise<ProductDetailDto> {
    const product = await this.productQueryRepository.findBySlug(query.slug);

    if (!product) {
      throw new ProductNotFoundException(query.slug);
    }

    return product;
  }
}
