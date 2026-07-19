import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPC_SERVICE_NAMES } from 'libs/shared/constants';
import type { PingRequest, PingResponse } from 'libs/shared/microservices';

@Controller()
export class ProductsGrpcController {
  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'Ping')
  ping(_data: PingRequest): PingResponse {
    return { ok: true, service: 'products-service' };
  }
}
