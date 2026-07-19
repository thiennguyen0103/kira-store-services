import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
import type { PingResponse, UsersGrpcService } from 'libs/shared/microservices';
import { UsersClientPort } from '../../application/ports/users-client.port';

@Injectable()
export class UsersClient extends UsersClientPort implements OnModuleInit {
  private usersService!: UsersGrpcService;

  constructor(
    @Inject(SERVICE_TOKENS.USERS_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.usersService = this.client.getService<UsersGrpcService>(
      GRPC_SERVICE_NAMES.USERS,
    );
  }

  ping(): Observable<PingResponse> {
    return this.usersService.ping({});
  }
}
