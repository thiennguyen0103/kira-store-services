import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { UserListItemDto } from '../../dto/user-list-item.dto';
import { UserQueryRepository } from '../repositories/user-query.repository';
import { SearchUsersQuery } from './search-users.query';

@QueryHandler(SearchUsersQuery)
export class SearchUsersHandler implements IQueryHandler<
  SearchUsersQuery,
  PagedResultDto<UserListItemDto>
> {
  constructor(private readonly repository: UserQueryRepository) {}

  async execute(
    query: SearchUsersQuery,
  ): Promise<PagedResultDto<UserListItemDto>> {
    return this.repository.search(query.filters);
  }
}
