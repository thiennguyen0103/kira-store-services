import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreatePaymentIntentInput,
  PaymentIntentResult,
  PaymentsClientPort,
  RefundPaymentInput,
  RefundPaymentResult,
} from 'apps/orders-service/src/application/ports/payments-client.port';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import type {
  CreatePaymentIntentRequest,
  PaymentsServiceClient,
  RefundPaymentRequest,
} from 'libs/shared/generated/payments';

@Injectable()
export class PaymentsClient extends PaymentsClientPort implements OnModuleInit {
  private paymentsService!: PaymentsServiceClient;

  constructor(
    @Inject(SERVICE_TOKENS.PAYMENTS_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.paymentsService = this.client.getService<PaymentsServiceClient>(
      GRPC_SERVICE_NAMES.PAYMENTS,
    );
  }

  async createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<PaymentIntentResult> {
    const request: CreatePaymentIntentRequest = {
      orderId: input.orderId,
      amountMinor: input.amountMinor,
      currency: input.currency,
      provider: input.provider,
      customerId: input.customerId,
      description: input.description ?? '',
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    };

    try {
      const payment = await firstValueFrom(
        this.paymentsService.createPaymentIntent(request),
      );
      return {
        paymentId: payment.id,
        checkoutUrl: payment.checkoutUrl,
        status: payment.status,
        provider: payment.provider,
      };
    } catch (error) {
      throw new DomainException('Failed to create payment intent.', {
        code: 'PAYMENT_INTENT_FAILED',
        details: { orderId: input.orderId },
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    if (!input.paymentId && !input.orderId) {
      throw new DomainException(
        'Either paymentId or orderId is required to refund.',
        { code: 'INVALID_REFUND_REQUEST' },
      );
    }

    const request: RefundPaymentRequest = {
      paymentId: input.paymentId ?? '',
      orderId: input.orderId ?? '',
      reason: input.reason ?? '',
    };

    try {
      const payment = await firstValueFrom(
        this.paymentsService.refundPayment(request),
      );
      return {
        paymentId: payment.id,
        status: payment.status,
        provider: payment.provider,
      };
    } catch (error) {
      throw new DomainException('Failed to refund payment.', {
        code: 'PAYMENT_REFUND_FAILED',
        details: {
          paymentId: input.paymentId,
          orderId: input.orderId,
        },
        cause: error instanceof Error ? error : undefined,
      });
    }
  }
}
