import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderRepositoryPort } from 'apps/orders-service/src/application/ports/order-repository.port';
import { Order } from 'apps/orders-service/src/domain/entities/order.entity';
import { CustomerId } from 'apps/orders-service/src/domain/value-objects/customer-id.vo';
import { OrderId } from 'apps/orders-service/src/domain/value-objects/order-id.vo';
import { OrderStatus } from 'libs/shared/enums';
import { DataSource, LessThan, Repository } from 'typeorm';
import { OrderItemOrmEntity } from './order-item.orm-entity';
import { OrderOrmEntity } from './order.orm-entity';
import { OrderPersistenceMapper } from './order-persistence.mapper';

@Injectable()
export class OrderRepository extends OrderRepositoryPort {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly orders: Repository<OrderOrmEntity>,
    @InjectRepository(OrderItemOrmEntity)
    private readonly items: Repository<OrderItemOrmEntity>,
    private readonly mapper: OrderPersistenceMapper,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async findById(id: OrderId): Promise<Order | null> {
    const order = await this.orders.findOne({
      where: { id: id.value },
      relations: { items: true },
    });
    return order ? this.mapper.toOrderDomain(order) : null;
  }

  async findByIdForCustomer(
    id: OrderId,
    customerId: CustomerId,
  ): Promise<Order | null> {
    const order = await this.orders.findOne({
      where: { id: id.value, customerId: customerId.value },
      relations: { items: true },
    });
    return order ? this.mapper.toOrderDomain(order) : null;
  }

  async findPaymentPendingOlderThan(cutoff: Date): Promise<Order[]> {
    const rows = await this.orders.find({
      where: {
        status: OrderStatus.PAYMENT_PENDING,
        updatedAt: LessThan(cutoff),
      },
      relations: { items: true },
    });
    return rows.map((row) => this.mapper.toOrderDomain(row));
  }

  async save(order: Order): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const orders = manager.getRepository(OrderOrmEntity);
      const items = manager.getRepository(OrderItemOrmEntity);

      const existing = await orders.findOne({
        where: { id: order.id.value },
        relations: { items: true },
      });

      await orders.save(this.mapper.toOrderOrm(order));

      const nextItemIds = new Set(order.items.map((item) => item.id.value));
      const orphaned = (existing?.items ?? []).filter(
        (item) => !nextItemIds.has(item.id),
      );
      if (orphaned.length > 0) {
        await items.remove(orphaned);
      }

      if (order.items.length > 0) {
        await items.save(
          order.items.map((item) =>
            this.mapper.toOrderItemOrm(item, order.id.value),
          ),
        );
      }
    });
  }
}
