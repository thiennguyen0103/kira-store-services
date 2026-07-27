import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CartDto } from 'apps/orders-service/src/application/dto/cart.dto';
import { CartRepositoryPort } from 'apps/orders-service/src/application/ports/cart-repository.port';
import { ProductsClientPort } from 'apps/orders-service/src/application/ports/products-client.port';
import { CartItem } from 'apps/orders-service/src/domain/entities/cart-item.entity';
import { CurrencyCode } from 'apps/orders-service/src/domain/enums/currency-code.enum';
import { CartItemId } from 'apps/orders-service/src/domain/value-objects/cart-item-id.vo';
import { CustomerId } from 'apps/orders-service/src/domain/value-objects/customer-id.vo';
import { Money } from 'apps/orders-service/src/domain/value-objects/money.vo';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { OrderPersistenceMapper } from 'apps/orders-service/src/infrastructure/persistence/write/order-persistence.mapper';
import { AddCartItemCommand } from './add-cart-item.command';

@CommandHandler(AddCartItemCommand)
export class AddCartItemHandler implements ICommandHandler<AddCartItemCommand> {
  constructor(
    private readonly carts: CartRepositoryPort,
    private readonly products: ProductsClientPort,
    private readonly mapper: OrderPersistenceMapper,
  ) {}

  async execute(command: AddCartItemCommand): Promise<CartDto> {
    if (!Number.isInteger(command.quantity) || command.quantity <= 0) {
      throw new DomainException('Quantity must be a positive integer.', {
        code: 'INVALID_CART_ITEM_QUANTITY',
      });
    }

    const snapshot = await this.products.getProductVariant(
      command.productId,
      command.variantId,
    );

    if (!snapshot.isActive || snapshot.productStatus !== 'ACTIVE') {
      throw new DomainException('Product variant is not available.', {
        code: 'PRODUCT_UNAVAILABLE',
        details: {
          productId: command.productId,
          variantId: command.variantId,
        },
      });
    }

    const customerId = CustomerId.restore(command.customerId);
    const cart = await this.carts.getOrCreate(customerId);

    const item = CartItem.create(CartItemId.create(), {
      productId: snapshot.productId,
      variantId: snapshot.variantId,
      productName: snapshot.productName,
      sku: snapshot.sku,
      quantity: command.quantity,
      unitPrice: Money.create(
        snapshot.unitPriceAmount,
        snapshot.currency as CurrencyCode,
      ),
    });

    cart.addItem(item);
    await this.carts.save(cart);
    return this.mapper.toCartDto(cart);
  }
}
