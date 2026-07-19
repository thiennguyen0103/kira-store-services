import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from 'apps/users-service/src/domain/exceptions/user-not-found.exception';
import { UserDetailDto } from '../../dto/user-detail.dto';
import { UserQueryRepository } from '../repositories/user-query.repository';
import { GetUserQuery } from './get-user.query';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  async execute(query: GetUserQuery): Promise<UserDetailDto> {
    const user = await this.userQueryRepository.findById(query.userId);

    if (!user) {
      throw new UserNotFoundException(query.userId);
    }

    return user;
  }
}
