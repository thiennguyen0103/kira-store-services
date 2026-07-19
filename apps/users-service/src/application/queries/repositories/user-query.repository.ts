import { AddressDto } from 'apps/users-service/src/application/dto/address.dto';
import { UserDetailDto } from 'apps/users-service/src/application/dto/user-detail.dto';
import { UserListItemDto } from 'apps/users-service/src/application/dto/user-list-item.dto';
import { UserProfileDto } from 'apps/users-service/src/application/dto/user-profile.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { SearchUsersDto } from '../../dto/search-users.dto';

export abstract class UserQueryRepository {
  /**
   * Get user detail.
   */
  abstract findById(id: string): Promise<UserDetailDto | null>;

  /**
   * Get user profile.
   */
  abstract findProfile(id: string): Promise<UserProfileDto | null>;

  /**
   * Get user by identity id.
   */
  abstract findByIdentityId(identityId: string): Promise<UserDetailDto | null>;

  /**
   * Get addresses.
   */
  abstract findAddresses(id: string): Promise<AddressDto[]>;

  /**
   * Get default address.
   */
  abstract findDefaultAddress(id: string): Promise<AddressDto | null>;

  /**
   * Search users.
   */
  abstract search(
    filters: SearchUsersDto,
  ): Promise<PagedResultDto<UserListItemDto>>;
}
