import { Cart } from 'apps/orders-service/src/domain/entities/cart.entity';
import { CustomerId } from 'apps/orders-service/src/domain/value-objects/customer-id.vo';

export abstract class CartRepositoryPort {
  abstract save(cart: Cart): Promise<void>;
  abstract findByCustomerId(customerId: CustomerId): Promise<Cart | null>;
  abstract getOrCreate(customerId: CustomerId): Promise<Cart>;
}
