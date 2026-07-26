import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { CategoryDto } from '../../dto/category.dto';

export abstract class CategoryQueryRepository {
  abstract findById(id: string): Promise<CategoryDto | null>;

  abstract list(
    page: PageRequestDto,
    options?: { activeOnly?: boolean; parentId?: string | null },
  ): Promise<PagedResultDto<CategoryDto>>;

  abstract findChildren(parentId: string): Promise<CategoryDto[]>;
}
