import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OrderEventsPublisherPort } from 'apps/orders-service/src/application/ports/order-events-publisher.port';
import { EVENT_NAMES } from 'libs/shared/constants';

export const ORDERS_TO_PRODUCTS_CLIENT = 'ORDERS_TO_PRODUCTS_CLIENT';
export const ORDERS_TO_PAYMENTS_CLIENT = 'ORDERS_TO_PAYMENTS_CLIENT';

const PRODUCTS_QUEUE_EVENTS = new Set<string>([
  EVENT_NAMES.ORDER_CREATED,
  EVENT_NAMES.ORDER_CANCELLED,
  EVENT_NAMES.ORDER_CONFIRMED,
]);

const PAYMENTS_QUEUE_EVENTS = new Set<string>([
  EVENT_NAMES.ORDER_PAYMENT_PENDING,
  EVENT_NAMES.ORDER_CANCELLED,
]);

@Injectable()
export class RmqEventPublisher extends OrderEventsPublisherPort {
  private readonly logger = new Logger(RmqEventPublisher.name);

  constructor(
    @Inject(ORDERS_TO_PRODUCTS_CLIENT)
    private readonly productsClient: ClientProxy,
    @Inject(ORDERS_TO_PAYMENTS_CLIENT)
    private readonly paymentsClient: ClientProxy,
  ) {
    super();
  }

  async publish<T extends object>(
    eventName: string,
    payload: T,
  ): Promise<void> {
    const clients = this.resolveClients(eventName);
    try {
      await Promise.all(
        clients.map((client) =>
          firstValueFrom(client.emit(eventName, payload)),
        ),
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish event ${eventName}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private resolveClients(eventName: string): ClientProxy[] {
    const clients: ClientProxy[] = [];
    if (PRODUCTS_QUEUE_EVENTS.has(eventName)) {
      clients.push(this.productsClient);
    }
    if (PAYMENTS_QUEUE_EVENTS.has(eventName)) {
      clients.push(this.paymentsClient);
    }
    if (clients.length === 0) {
      this.logger.warn(
        `No queue mapping for event ${eventName}; defaulting to products_queue`,
      );
      clients.push(this.productsClient);
    }
    return clients;
  }
}
