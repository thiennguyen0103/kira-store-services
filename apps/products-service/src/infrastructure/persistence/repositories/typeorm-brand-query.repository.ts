import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BrandDto } from 'apps/products-service/src/application/dto/brand.dto';
import { BrandQueryRepository } from 'apps/products-service/src/application/queries/repositories/brand-query.repository';
import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { Repository } from 'typeorm';
import { BrandOrmEntity } from '../entities/brand.orm-entity';
import { BrandPersistenceMapper } from '../mappers/brand-persistence.mapper';

@Injectable()
export class TypeOrmBrandQueryRepository extends BrandQueryRepository {
  constructor(
    @InjectRepository(BrandOrmEntity)
    private readonly brands: Repository<BrandOrmEntity>,
    private readonly mapper: BrandPersistenceMapper,
  ) {
    super();
  }

  async findById(id: string): Promise<BrandDto | null> {
    const brand = await this.brands.findOne({ where: { id } });
    return brand ? this.mapper.toDto(brand) : null;
  }

  async list(
    page: PageRequestDto,
    activeOnly?: boolean,
  ): Promise<PagedResultDto<BrandDto>> {
    const qb = this.brands
      .createQueryBuilder('brand')
      .orderBy('brand.name', 'ASC')
      .skip(page.offset)
      .take(page.limit);

    if (activeOnly) {
      qb.andWhere('brand.isActive = true');
    }

    const [items, total] = await qb.getManyAndCount();
    return new PagedResultDto(
      items.map((item) => this.mapper.toDto(item)),
      total,
      page.page,
      page.limit,
    );
  }
}
