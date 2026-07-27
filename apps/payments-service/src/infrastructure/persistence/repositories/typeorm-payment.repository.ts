import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from 'apps/payments-service/src/domain/entities/payment.entity';
import { PaymentRepository } from 'apps/payments-service/src/domain/repositories/payment.repository';
import { PaymentId } from 'apps/payments-service/src/domain/value-objects/payment-id.vo';
import { Repository } from 'typeorm';
import { PaymentOrmEntity } from '../entities/payment.orm-entity';
import { PaymentPersistenceMapper } from '../mappers/payment-persistence.mapper';

@Injectable()
export class TypeOrmPaymentRepository extends PaymentRepository {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly payments: Repository<PaymentOrmEntity>,
    private readonly mapper: PaymentPersistenceMapper,
  ) {
    super();
  }

  async save(payment: Payment): Promise<void> {
    await this.payments.save(this.mapper.toOrm(payment));
  }

  async findById(id: PaymentId): Promise<Payment | null> {
    const row = await this.payments.findOne({ where: { id: id.value } });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const row = await this.payments.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findByProviderPaymentId(
    providerPaymentId: string,
  ): Promise<Payment | null> {
    const row = await this.payments.findOne({
      where: { providerPaymentId },
    });
    return row ? this.mapper.toDomain(row) : null;
  }
}
