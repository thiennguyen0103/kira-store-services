import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CartDto } from 'apps/orders-service/src/application/dto/cart.dto';
import { CartRepositoryPort } from 'apps/orders-service/src/application/ports/cart-repository.port';
import { CustomerId } from 'apps/orders-service/src/domain/value-objects/customer-id.vo';
import { OrderPersistenceMapper } from 'apps/orders-service/src/infrastructure/persistence/write/order-persistence.mapper';
import { GetCartQuery } from './get-cart.query';

@QueryHandler(GetCartQuery)
export class GetCartHandler implements IQueryHandler<GetCartQuery> {
  constructor(
    private readonly carts: CartRepositoryPort,
    private readonly mapper: OrderPersistenceMapper,
  ) {}

  async execute(query: GetCartQuery): Promise<CartDto> {
    const customerId = CustomerId.restore(query.customerId);
    const cart = await this.carts.getOrCreate(customerId);
    return this.mapper.toCartDto(cart);
  }
}
