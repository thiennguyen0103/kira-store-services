import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaymentDto } from 'apps/payments-service/src/application/dto/payment.dto';
import { PaymentNotFoundException } from 'apps/payments-service/src/domain/exceptions/payment-not-found.exception';
import { PaymentQueryRepository } from '../repositories/payment-query.repository';
import { GetPaymentByOrderIdQuery } from './get-payment-by-order-id.query';

@QueryHandler(GetPaymentByOrderIdQuery)
export class GetPaymentByOrderIdHandler implements IQueryHandler<GetPaymentByOrderIdQuery> {
  constructor(private readonly paymentQueries: PaymentQueryRepository) {}

  async execute(query: GetPaymentByOrderIdQuery): Promise<PaymentDto> {
    const payment = await this.paymentQueries.findByOrderId(query.orderId);
    if (!payment) {
      throw new PaymentNotFoundException(query.orderId);
    }
    return payment;
  }
}
