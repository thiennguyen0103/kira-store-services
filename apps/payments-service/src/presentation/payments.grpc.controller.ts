import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { CreatePaymentIntentCommand } from 'apps/payments-service/src/application/commands/create-payment-intent/create-payment-intent.command';
import { RefundPaymentCommand } from 'apps/payments-service/src/application/commands/refund-payment/refund-payment.command';
import { PaymentDto } from 'apps/payments-service/src/application/dto/payment.dto';
import { GetPaymentByOrderIdQuery } from 'apps/payments-service/src/application/queries/get-payment-by-order-id/get-payment-by-order-id.query';
import { GetPaymentQuery } from 'apps/payments-service/src/application/queries/get-payment/get-payment.query';
import { GRPC_SERVICE_NAMES } from 'libs/shared/constants';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import type {
  CreatePaymentIntentRequest,
  GetPaymentByOrderIdRequest,
  GetPaymentRequest,
  PaymentResponse,
  PingRequest,
  PingResponse,
  RefundPaymentRequest,
} from 'libs/shared/generated/payments';
import { PaymentResponseMapper } from './mappers/payment-response.mapper';

function optionalString(value: string | undefined): string | undefined {
  return value === '' || value === undefined ? undefined : value;
}

@Controller()
export class PaymentsGrpcController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod(GRPC_SERVICE_NAMES.PAYMENTS, 'Ping')
  ping(_data: PingRequest): PingResponse {
    return { ok: true, service: 'payments-service' };
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PAYMENTS, 'CreatePaymentIntent')
  async createPaymentIntent(
    request: CreatePaymentIntentRequest,
  ): Promise<PaymentResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        CreatePaymentIntentCommand,
        PaymentDto
      >(
        new CreatePaymentIntentCommand(
          request.orderId,
          request.amountMinor,
          request.currency,
          request.provider,
          optionalString(request.customerId),
          optionalString(request.description),
          optionalString(request.successUrl),
          optionalString(request.cancelUrl),
        ),
      );
      return PaymentResponseMapper.toGrpc(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PAYMENTS, 'GetPayment')
  async getPayment(request: GetPaymentRequest): Promise<PaymentResponse> {
    return this.execute(async () => {
      const dto = await this.queryBus.execute<GetPaymentQuery, PaymentDto>(
        new GetPaymentQuery(request.paymentId),
      );
      return PaymentResponseMapper.toGrpc(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PAYMENTS, 'GetPaymentByOrderId')
  async getPaymentByOrderId(
    request: GetPaymentByOrderIdRequest,
  ): Promise<PaymentResponse> {
    return this.execute(async () => {
      const dto = await this.queryBus.execute<
        GetPaymentByOrderIdQuery,
        PaymentDto
      >(new GetPaymentByOrderIdQuery(request.orderId));
      return PaymentResponseMapper.toGrpc(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PAYMENTS, 'RefundPayment')
  async refundPayment(request: RefundPaymentRequest): Promise<PaymentResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        RefundPaymentCommand,
        PaymentDto
      >(
        new RefundPaymentCommand(
          optionalString(request.paymentId),
          optionalString(request.orderId),
          optionalString(request.reason),
        ),
      );
      return PaymentResponseMapper.toGrpc(dto);
    });
  }

  private async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw this.toRpcException(error);
    }
  }

  private toRpcException(error: unknown): RpcException {
    if (error instanceof DomainException) {
      return new RpcException({
        code: this.mapGrpcCode(error.code),
        message: error.message,
      });
    }

    if (error instanceof Error) {
      return new RpcException({
        code: GrpcStatus.INTERNAL,
        message: error.message,
      });
    }

    return new RpcException({
      code: GrpcStatus.INTERNAL,
      message: 'Internal error',
    });
  }

  private mapGrpcCode(code: string): GrpcStatus {
    if (code.endsWith('_NOT_FOUND')) {
      return GrpcStatus.NOT_FOUND;
    }

    switch (code) {
      case 'PAYMENT_ALREADY_SUCCEEDED':
        return GrpcStatus.ALREADY_EXISTS;
      case 'INVALID_PAYMENT_STATE':
        return GrpcStatus.FAILED_PRECONDITION;
      default:
        return GrpcStatus.INVALID_ARGUMENT;
    }
  }
}
