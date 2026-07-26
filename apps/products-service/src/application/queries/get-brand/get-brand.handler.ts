import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BrandNotFoundException } from 'apps/products-service/src/domain/exceptions/brand-not-found.exception';
import { BrandDto } from '../../dto/brand.dto';
import { BrandQueryRepository } from '../repositories/brand-query.repository';
import { GetBrandQuery } from './get-brand.query';

@QueryHandler(GetBrandQuery)
export class GetBrandHandler implements IQueryHandler<GetBrandQuery> {
  constructor(private readonly brandQueryRepository: BrandQueryRepository) {}

  async execute(query: GetBrandQuery): Promise<BrandDto> {
    const brand = await this.brandQueryRepository.findById(query.brandId);

    if (!brand) {
      throw new BrandNotFoundException(query.brandId);
    }

    return brand;
  }
}
