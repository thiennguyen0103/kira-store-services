import { Observable } from 'rxjs';
import type {
  GetAddressesRequest,
  GetAddressesResponse,
  GetDefaultAddressRequest,
  GetDefaultAddressResponse,
  GetUserByIdentityIdRequest,
  GetUserByIdentityIdResponse,
  GetUserRequest,
  SearchUsersRequest,
  SearchUsersResponse,
  UserDetailResponse,
} from 'libs/shared/generated/users';

export abstract class UsersClientPort {
  abstract getUser(request: GetUserRequest): Observable<UserDetailResponse>;

  abstract getAddresses(
    request: GetAddressesRequest,
  ): Observable<GetAddressesResponse>;

  abstract getDefaultAddress(
    request: GetDefaultAddressRequest,
  ): Observable<GetDefaultAddressResponse>;

  abstract getUserByIdentityId(
    request: GetUserByIdentityIdRequest,
  ): Observable<GetUserByIdentityIdResponse>;

  abstract searchUsers(
    request: SearchUsersRequest,
  ): Observable<SearchUsersResponse>;
}
