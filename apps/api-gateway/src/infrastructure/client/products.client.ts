import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
import type {
  PingResponse,
  ProductsGrpcService,
} from 'libs/shared/microservices';
import { ProductsClientPort } from '../../application/ports/products-client.port';

@Injectable()
export class ProductsClient extends ProductsClientPort implements OnModuleInit {
  private productsService!: ProductsGrpcService;

  constructor(
    @Inject(SERVICE_TOKENS.PRODUCTS_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.productsService = this.client.getService<ProductsGrpcService>(
      GRPC_SERVICE_NAMES.PRODUCTS,
    );
  }

  ping(): Observable<PingResponse> {
    return this.productsService.ping({});
  }
}
