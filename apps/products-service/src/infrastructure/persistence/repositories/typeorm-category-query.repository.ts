import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryDto } from 'apps/products-service/src/application/dto/category.dto';
import { CategoryQueryRepository } from 'apps/products-service/src/application/queries/repositories/category-query.repository';
import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { Repository } from 'typeorm';
import { CategoryOrmEntity } from '../entities/category.orm-entity';
import { CategoryPersistenceMapper } from '../mappers/category-persistence.mapper';

@Injectable()
export class TypeOrmCategoryQueryRepository extends CategoryQueryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly categories: Repository<CategoryOrmEntity>,
    private readonly mapper: CategoryPersistenceMapper,
  ) {
    super();
  }

  async findById(id: string): Promise<CategoryDto | null> {
    const category = await this.categories.findOne({ where: { id } });
    return category ? this.mapper.toDto(category) : null;
  }

  async list(
    page: PageRequestDto,
    options?: { activeOnly?: boolean; parentId?: string | null },
  ): Promise<PagedResultDto<CategoryDto>> {
    const qb = this.categories
      .createQueryBuilder('category')
      .orderBy('category.path', 'ASC')
      .skip(page.offset)
      .take(page.limit);

    if (options?.activeOnly) {
      qb.andWhere('category.isActive = true');
    }

    if (options?.parentId === null) {
      qb.andWhere('category.parentId IS NULL');
    } else if (options?.parentId) {
      qb.andWhere('category.parentId = :parentId', {
        parentId: options.parentId,
      });
    }

    const [items, total] = await qb.getManyAndCount();
    return new PagedResultDto(
      items.map((item) => this.mapper.toDto(item)),
      total,
      page.page,
      page.limit,
    );
  }

  async findChildren(parentId: string): Promise<CategoryDto[]> {
    const children = await this.categories.find({
      where: { parentId },
      order: { name: 'ASC' },
    });
    return children.map((child) => this.mapper.toDto(child));
  }
}
