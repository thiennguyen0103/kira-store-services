import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPC_SERVICE_NAMES } from 'libs/shared/constants';
import type { PingRequest, PingResponse } from 'libs/shared/microservices';

@Controller()
export class PaymentsGrpcController {
  @GrpcMethod(GRPC_SERVICE_NAMES.PAYMENTS, 'Ping')
  ping(_data: PingRequest): PingResponse {
    return { ok: true, service: 'payments-service' };
  }
}
