import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ListOrdersFilter,
  OrderReadModelPort,
} from 'apps/orders-service/src/application/ports/order-read-model.port';
import type {
  OrderDetailDto,
  OrderSummaryDto,
} from 'apps/orders-service/src/application/dto/order.dto';
import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { Repository } from 'typeorm';
import { OrderOrmEntity } from '../write/order.orm-entity';
import { OrderPersistenceMapper } from '../write/order-persistence.mapper';

@Injectable()
export class OrderReadRepository extends OrderReadModelPort {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly orders: Repository<OrderOrmEntity>,
    private readonly mapper: OrderPersistenceMapper,
  ) {
    super();
  }

  async findById(id: string): Promise<OrderDetailDto | null> {
    const order = await this.orders.findOne({
      where: { id },
      relations: { items: true },
    });
    return order ? this.mapper.toOrderDetailDtoFromOrm(order) : null;
  }

  async findByIdForCustomer(
    id: string,
    customerId: string,
  ): Promise<OrderDetailDto | null> {
    const order = await this.orders.findOne({
      where: { id, customerId },
      relations: { items: true },
    });
    return order ? this.mapper.toOrderDetailDtoFromOrm(order) : null;
  }

  async list(
    page: PageRequestDto,
    filter?: ListOrdersFilter,
  ): Promise<PagedResultDto<OrderSummaryDto>> {
    const qb = this.orders.createQueryBuilder('o');

    if (filter?.customerId) {
      qb.andWhere('o.customer_id = :customerId', {
        customerId: filter.customerId,
      });
    }
    if (filter?.status) {
      qb.andWhere('o.status = :status', { status: filter.status });
    }

    qb.orderBy('o.created_at', 'DESC').skip(page.offset).take(page.limit);

    const [rows, total] = await qb.getManyAndCount();

    return new PagedResultDto(
      rows.map((row) => ({
        id: row.id,
        customerId: row.customerId,
        status: row.status,
        total: {
          amountMinor: Number(row.totalAmount),
          currency: row.totalCurrency,
        },
        paymentProvider: row.paymentProvider,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      total,
      page.page,
      page.limit,
    );
  }
}
