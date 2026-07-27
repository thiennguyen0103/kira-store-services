import { OrderStatus as OrderStatusEnum } from 'libs/shared/enums';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { OrderStatus } from './order-status.vo';

describe('OrderStatus', () => {
  it('allows the happy-path checkout transitions', () => {
    let status = OrderStatus.create(OrderStatusEnum.PENDING);
    status = status.transitionTo(OrderStatusEnum.AWAITING_STOCK);
    status = status.transitionTo(OrderStatusEnum.PAYMENT_PENDING);
    status = status.transitionTo(OrderStatusEnum.PAID);
    status = status.transitionTo(OrderStatusEnum.CONFIRMED);

    expect(status.value).toBe(OrderStatusEnum.CONFIRMED);
  });

  it('allows cancel from payment pending', () => {
    const status = OrderStatus.create(
      OrderStatusEnum.PAYMENT_PENDING,
    ).transitionTo(OrderStatusEnum.CANCELLED);
    expect(status.value).toBe(OrderStatusEnum.CANCELLED);
    expect(status.isTerminal()).toBe(true);
  });

  it('rejects illegal transitions', () => {
    const status = OrderStatus.create(OrderStatusEnum.PENDING);
    expect(() => status.transitionTo(OrderStatusEnum.CONFIRMED)).toThrow(
      DomainException,
    );
  });

  it('supports refund path from confirmed', () => {
    const status = OrderStatus.create(OrderStatusEnum.CONFIRMED)
      .transitionTo(OrderStatusEnum.REFUNDING)
      .transitionTo(OrderStatusEnum.REFUNDED);

    expect(status.value).toBe(OrderStatusEnum.REFUNDED);
    expect(status.isTerminal()).toBe(true);
  });
});
