import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { ProductDetailDto, ProductListItemDto } from '../../dto/product.dto';

export interface ListProductsFilter {
  status?: string;
  categoryId?: string;
  brandId?: string;
  query?: string;
}

export abstract class ProductQueryRepository {
  abstract findById(id: string): Promise<ProductDetailDto | null>;

  abstract findBySlug(slug: string): Promise<ProductDetailDto | null>;

  abstract list(
    page: PageRequestDto,
    filter?: ListProductsFilter,
  ): Promise<PagedResultDto<ProductListItemDto>>;
}
