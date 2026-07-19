import { SearchUsersDto } from '../../dto/search-users.dto';

export class SearchUsersQuery {
  constructor(public readonly filters: SearchUsersDto) {}
}
