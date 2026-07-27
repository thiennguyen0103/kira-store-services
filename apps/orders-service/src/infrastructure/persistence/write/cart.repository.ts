import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartRepositoryPort } from 'apps/orders-service/src/application/ports/cart-repository.port';
import { Cart } from 'apps/orders-service/src/domain/entities/cart.entity';
import { CartId } from 'apps/orders-service/src/domain/value-objects/cart-id.vo';
import { CustomerId } from 'apps/orders-service/src/domain/value-objects/customer-id.vo';
import { DataSource, Repository } from 'typeorm';
import { CartItemOrmEntity } from './cart-item.orm-entity';
import { CartOrmEntity } from './cart.orm-entity';
import { OrderPersistenceMapper } from './order-persistence.mapper';

@Injectable()
export class CartRepository extends CartRepositoryPort {
  constructor(
    @InjectRepository(CartOrmEntity)
    private readonly carts: Repository<CartOrmEntity>,
    @InjectRepository(CartItemOrmEntity)
    private readonly items: Repository<CartItemOrmEntity>,
    private readonly mapper: OrderPersistenceMapper,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async findByCustomerId(customerId: CustomerId): Promise<Cart | null> {
    const cart = await this.carts.findOne({
      where: { customerId: customerId.value },
      relations: { items: true },
    });
    return cart ? this.mapper.toCartDomain(cart) : null;
  }

  async getOrCreate(customerId: CustomerId): Promise<Cart> {
    const existing = await this.findByCustomerId(customerId);
    if (existing) {
      return existing;
    }
    const cart = Cart.create(CartId.create(), customerId);
    await this.save(cart);
    return cart;
  }

  async save(cart: Cart): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const carts = manager.getRepository(CartOrmEntity);
      const items = manager.getRepository(CartItemOrmEntity);

      const existing = await carts.findOne({
        where: { id: cart.id.value },
        relations: { items: true },
      });

      await carts.save(this.mapper.toCartOrm(cart));

      const nextItemIds = new Set(cart.items.map((item) => item.id.value));
      const orphaned = (existing?.items ?? []).filter(
        (item) => !nextItemIds.has(item.id),
      );
      if (orphaned.length > 0) {
        await items.remove(orphaned);
      }

      if (cart.items.length > 0) {
        await items.save(
          cart.items.map((item) =>
            this.mapper.toCartItemOrm(item, cart.id.value),
          ),
        );
      } else if ((existing?.items ?? []).length > 0) {
        await items.remove(existing!.items);
      }
    });
  }
}
