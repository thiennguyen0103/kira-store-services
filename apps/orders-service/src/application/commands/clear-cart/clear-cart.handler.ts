import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CartDto } from 'apps/orders-service/src/application/dto/cart.dto';
import { CartRepositoryPort } from 'apps/orders-service/src/application/ports/cart-repository.port';
import { CustomerId } from 'apps/orders-service/src/domain/value-objects/customer-id.vo';
import { OrderPersistenceMapper } from 'apps/orders-service/src/infrastructure/persistence/write/order-persistence.mapper';
import { ClearCartCommand } from './clear-cart.command';

@CommandHandler(ClearCartCommand)
export class ClearCartHandler implements ICommandHandler<ClearCartCommand> {
  constructor(
    private readonly carts: CartRepositoryPort,
    private readonly mapper: OrderPersistenceMapper,
  ) {}

  async execute(command: ClearCartCommand): Promise<CartDto> {
    const customerId = CustomerId.restore(command.customerId);
    const cart = await this.carts.getOrCreate(customerId);
    cart.clear();
    await this.carts.save(cart);
    return this.mapper.toCartDto(cart);
  }
}
