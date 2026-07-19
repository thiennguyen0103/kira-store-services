import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { EUserSortBy } from '../../domain/enums/user-sort-by.enum';
import { ESortDirection } from 'libs/shared/enums/sort-direction.enum';

export class SearchUsersDto extends PageRequestDto {
  constructor(
    page: number,
    limit: number,
    public readonly keyword?: string,
    public readonly sortBy: EUserSortBy = EUserSortBy.CREATED_AT,
    public readonly sortDirection: ESortDirection = ESortDirection.DESC,
  ) {
    super(page, limit);
  }

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
