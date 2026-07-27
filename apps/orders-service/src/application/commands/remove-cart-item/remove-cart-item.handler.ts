import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CartDto } from 'apps/orders-service/src/application/dto/cart.dto';
import { CartRepositoryPort } from 'apps/orders-service/src/application/ports/cart-repository.port';
import { CartNotFoundException } from 'apps/orders-service/src/domain/exceptions/cart-not-found.exception';
import { CustomerId } from 'apps/orders-service/src/domain/value-objects/customer-id.vo';
import { OrderPersistenceMapper } from 'apps/orders-service/src/infrastructure/persistence/write/order-persistence.mapper';
import { RemoveCartItemCommand } from './remove-cart-item.command';

@CommandHandler(RemoveCartItemCommand)
export class RemoveCartItemHandler implements ICommandHandler<RemoveCartItemCommand> {
  constructor(
    private readonly carts: CartRepositoryPort,
    private readonly mapper: OrderPersistenceMapper,
  ) {}

  async execute(command: RemoveCartItemCommand): Promise<CartDto> {
    const customerId = CustomerId.restore(command.customerId);
    const cart = await this.carts.findByCustomerId(customerId);
    if (!cart) {
      throw new CartNotFoundException(command.customerId);
    }

    cart.removeItem(command.productId, command.variantId);
    await this.carts.save(cart);
    return this.mapper.toCartDto(cart);
  }
}
