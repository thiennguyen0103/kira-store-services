import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentDto } from 'apps/payments-service/src/application/dto/payment.dto';
import { PaymentQueryRepository } from 'apps/payments-service/src/application/queries/repositories/payment-query.repository';
import { Repository } from 'typeorm';
import { PaymentOrmEntity } from '../entities/payment.orm-entity';
import { PaymentPersistenceMapper } from '../mappers/payment-persistence.mapper';

@Injectable()
export class TypeOrmPaymentQueryRepository extends PaymentQueryRepository {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly payments: Repository<PaymentOrmEntity>,
    private readonly mapper: PaymentPersistenceMapper,
  ) {
    super();
  }

  async findById(paymentId: string): Promise<PaymentDto | null> {
    const row = await this.payments.findOne({ where: { id: paymentId } });
    return row ? this.mapper.toDto(row) : null;
  }

  async findByOrderId(orderId: string): Promise<PaymentDto | null> {
    const row = await this.payments.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
    return row ? this.mapper.toDto(row) : null;
  }
}
