import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { BrandDto } from '../../dto/brand.dto';

export abstract class BrandQueryRepository {
  abstract findById(id: string): Promise<BrandDto | null>;

  abstract list(
    page: PageRequestDto,
    activeOnly?: boolean,
  ): Promise<PagedResultDto<BrandDto>>;
}
