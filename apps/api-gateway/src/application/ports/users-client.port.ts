import { Observable } from 'rxjs';
import type {
  AddAddressRequest,
  GetAddressesRequest,
  GetAddressesResponse,
  GetDefaultAddressRequest,
  GetDefaultAddressResponse,
  GetUserByIdentityIdRequest,
  GetUserByIdentityIdResponse,
  GetUserRequest,
  MutationResponse,
  RemoveAddressRequest,
  SearchUsersRequest,
  SearchUsersResponse,
  SetDefaultAddressRequest,
  UpdateAddressRequest,
  UpdateAvatarRequest,
  UpdateProfileRequest,
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

  abstract updateProfile(
    request: UpdateProfileRequest,
  ): Observable<MutationResponse>;

  abstract updateAvatar(
    request: UpdateAvatarRequest,
  ): Observable<MutationResponse>;

  abstract addAddress(request: AddAddressRequest): Observable<MutationResponse>;

  abstract updateAddress(
    request: UpdateAddressRequest,
  ): Observable<MutationResponse>;

  abstract removeAddress(
    request: RemoveAddressRequest,
  ): Observable<MutationResponse>;

  abstract setDefaultAddress(
    request: SetDefaultAddressRequest,
  ): Observable<MutationResponse>;
}
