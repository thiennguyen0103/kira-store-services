import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
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

  getUserByIdentityId(
    request: GetUserByIdentityIdRequest,
  ): Observable<GetUserByIdentityIdResponse> {
    return this.usersService.getUserByIdentityId(request);
  }

  searchUsers(request: SearchUsersRequest): Observable<SearchUsersResponse> {
    return this.usersService.searchUsers(request);
  }
}
