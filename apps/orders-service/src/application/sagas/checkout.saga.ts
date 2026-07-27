import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { CancelOrderCommand } from 'apps/orders-service/src/application/commands/cancel-order/cancel-order.command';
import { OrderRepositoryPort } from 'apps/orders-service/src/application/ports/order-repository.port';

const ONE_MINUTE_MS = 60_000;

/**
 * Thin checkout orchestration helper.
 * RMQ EventPatterns live in product/payment subscribers and dispatch commands.
 * This class owns unpaid payment timeout cancellation.
 */
@Injectable()
export class CheckoutSaga implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CheckoutSaga.name);
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private readonly orders: OrderRepositoryPort,
    private readonly commandBus: CommandBus,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.cancelExpiredPaymentPendingOrders();
    }, ONE_MINUTE_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async cancelExpiredPaymentPendingOrders(): Promise<void> {
    const timeoutMinutes = this.config.get<number>(
      'ORDER_PAYMENT_TIMEOUT_MINUTES',
      30,
    );
    const cutoff = new Date(Date.now() - timeoutMinutes * 60_000);

    try {
      const expired = await this.orders.findPaymentPendingOlderThan(cutoff);
      for (const order of expired) {
        try {
          await this.commandBus.execute(
            new CancelOrderCommand(
              order.id.value,
              undefined,
              `Payment timeout after ${timeoutMinutes} minutes`,
            ),
          );
          this.logger.log(
            `Cancelled unpaid order ${order.id.value} (timeout ${timeoutMinutes}m)`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to cancel unpaid order ${order.id.value}`,
            error instanceof Error ? error.stack : undefined,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Failed scanning unpaid payment-pending orders',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
