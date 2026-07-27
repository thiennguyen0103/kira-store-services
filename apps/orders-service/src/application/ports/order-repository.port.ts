import { Order } from 'apps/orders-service/src/domain/entities/order.entity';
import { OrderId } from 'apps/orders-service/src/domain/value-objects/order-id.vo';
import { CustomerId } from 'apps/orders-service/src/domain/value-objects/customer-id.vo';

export abstract class OrderRepositoryPort {
  abstract save(order: Order): Promise<void>;
  abstract findById(id: OrderId): Promise<Order | null>;
  abstract findByIdForCustomer(
    id: OrderId,
    customerId: CustomerId,
  ): Promise<Order | null>;
  abstract findPaymentPendingOlderThan(cutoff: Date): Promise<Order[]>;
}
