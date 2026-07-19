import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
import type {
  OrdersGrpcService,
  PingResponse,
} from 'libs/shared/microservices';
import { OrdersClientPort } from '../../application/ports/orders-client.port';

@Injectable()
export class OrdersClient extends OrdersClientPort implements OnModuleInit {
  private ordersService!: OrdersGrpcService;

  constructor(
    @Inject(SERVICE_TOKENS.ORDERS_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.ordersService = this.client.getService<OrdersGrpcService>(
      GRPC_SERVICE_NAMES.ORDERS,
    );
  }

  ping(): Observable<PingResponse> {
    return this.ordersService.ping({});
  }
}
