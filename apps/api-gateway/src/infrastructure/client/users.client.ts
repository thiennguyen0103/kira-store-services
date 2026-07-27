import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
import type {
  AddAddressRequest,
  GetAddressesRequest,
  GetAddressesResponse,
  GetAddressByIdRequest,
  GetAddressByIdResponse,
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
  UsersServiceClient,
} from 'libs/shared/generated/users';
import { UsersClientPort } from '../../application/ports/users-client.port';

@Injectable()
export class UsersClient extends UsersClientPort implements OnModuleInit {
  private usersService!: UsersServiceClient;

  constructor(
    @Inject(SERVICE_TOKENS.USERS_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.usersService = this.client.getService<UsersServiceClient>(
      GRPC_SERVICE_NAMES.USERS,
    );
  }

  getUser(request: GetUserRequest): Observable<UserDetailResponse> {
    return this.usersService.getUser(request);
  }

  getAddresses(request: GetAddressesRequest): Observable<GetAddressesResponse> {
    return this.usersService.getAddresses(request);
  }

  getDefaultAddress(
    request: GetDefaultAddressRequest,
  ): Observable<GetDefaultAddressResponse> {
    return this.usersService.getDefaultAddress(request);
  }

  getAddressById(
    request: GetAddressByIdRequest,
  ): Observable<GetAddressByIdResponse> {
    return this.usersService.getAddressById(request);
  }

  getUserByIdentityId(
    request: GetUserByIdentityIdRequest,
  ): Observable<GetUserByIdentityIdResponse> {
    return this.usersService.getUserByIdentityId(request);
  }

  searchUsers(request: SearchUsersRequest): Observable<SearchUsersResponse> {
    return this.usersService.searchUsers(request);
  }

  updateProfile(request: UpdateProfileRequest): Observable<MutationResponse> {
    return this.usersService.updateProfile(request);
  }

  updateAvatar(request: UpdateAvatarRequest): Observable<MutationResponse> {
    return this.usersService.updateAvatar(request);
  }

  addAddress(request: AddAddressRequest): Observable<MutationResponse> {
    return this.usersService.addAddress(request);
  }

  updateAddress(request: UpdateAddressRequest): Observable<MutationResponse> {
    return this.usersService.updateAddress(request);
  }

  removeAddress(request: RemoveAddressRequest): Observable<MutationResponse> {
    return this.usersService.removeAddress(request);
  }

  setDefaultAddress(
    request: SetDefaultAddressRequest,
  ): Observable<MutationResponse> {
    return this.usersService.setDefaultAddress(request);
  }
}
