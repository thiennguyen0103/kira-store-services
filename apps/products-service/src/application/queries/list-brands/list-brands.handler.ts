import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { BrandDto } from '../../dto/brand.dto';
import { BrandQueryRepository } from '../repositories/brand-query.repository';
import { ListBrandsQuery } from './list-brands.query';

@QueryHandler(ListBrandsQuery)
export class ListBrandsHandler implements IQueryHandler<
  ListBrandsQuery,
  PagedResultDto<BrandDto>
> {
  constructor(private readonly brandQueryRepository: BrandQueryRepository) {}

  async execute(query: ListBrandsQuery): Promise<PagedResultDto<BrandDto>> {
    return this.brandQueryRepository.list(
      new PageRequestDto(query.page, query.limit),
      query.activeOnly,
    );
  }
}
