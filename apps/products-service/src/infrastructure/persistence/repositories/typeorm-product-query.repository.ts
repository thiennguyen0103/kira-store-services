import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ListProductsFilter,
  ProductQueryRepository,
} from 'apps/products-service/src/application/queries/repositories/product-query.repository';
import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import {
  ProductDetailDto,
  ProductListItemDto,
} from 'apps/products-service/src/application/dto/product.dto';
import { Repository } from 'typeorm';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { ProductPersistenceMapper } from '../mappers/product-persistence.mapper';

@Injectable()
export class TypeOrmProductQueryRepository extends ProductQueryRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly products: Repository<ProductOrmEntity>,
    private readonly mapper: ProductPersistenceMapper,
  ) {
    super();
  }

  async findById(id: string): Promise<ProductDetailDto | null> {
    const product = await this.products.findOne({
      where: { id },
      relations: { variants: true, images: true },
    });
    return product ? this.mapper.toDetailDto(product) : null;
  }

  async findBySlug(slug: string): Promise<ProductDetailDto | null> {
    const product = await this.products.findOne({
      where: { slug },
      relations: { variants: true, images: true },
    });
    return product ? this.mapper.toDetailDto(product) : null;
  }

  async list(
    page: PageRequestDto,
    filter?: ListProductsFilter,
  ): Promise<PagedResultDto<ProductListItemDto>> {
    const qb = this.products
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .orderBy('product.createdAt', 'DESC')
      .skip(page.offset)
      .take(page.limit);

    if (filter?.status) {
      qb.andWhere('product.status = :status', { status: filter.status });
    }
    if (filter?.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: filter.categoryId,
      });
    }
    if (filter?.brandId) {
      qb.andWhere('product.brandId = :brandId', { brandId: filter.brandId });
    }
    if (filter?.query) {
      qb.andWhere('(product.name ILIKE :query OR product.slug ILIKE :query)', {
        query: `%${filter.query}%`,
      });
    }

    const [items, total] = await qb.getManyAndCount();
    return new PagedResultDto(
      items.map((item) => this.mapper.toListItemDto(item)),
      total,
      page.page,
      page.limit,
    );
  }
}
