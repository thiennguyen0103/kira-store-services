import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IdentityNotFoundException } from 'apps/users-service/src/domain/exceptions/identity-not-found.exception';
import { UserDetailDto } from '../../dto/user-detail.dto';
import { UserQueryRepository } from '../repositories/user-query.repository';
import { GetUserByIdentityIdQuery } from './get-user-by-identity-id.query';

@QueryHandler(GetUserByIdentityIdQuery)
export class GetUserByIdentityIdHandler implements IQueryHandler<
  GetUserByIdentityIdQuery,
  UserDetailDto
> {
  constructor(private readonly repository: UserQueryRepository) {}

  async execute(query: GetUserByIdentityIdQuery): Promise<UserDetailDto> {
    const user = await this.repository.findByIdentityId(query.identityId);

    if (!user) {
      throw new IdentityNotFoundException(query.identityId);
    }

    return user;
  }
}
