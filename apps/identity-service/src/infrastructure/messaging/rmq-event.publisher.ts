import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { EventPublisher } from 'libs/shared/interfaces';

export const IDENTITY_EVENT_CLIENT = 'IDENTITY_EVENT_CLIENT';

@Injectable()
export class RmqEventPublisher extends EventPublisher {
  private readonly logger = new Logger(RmqEventPublisher.name);

  constructor(
    @Inject(IDENTITY_EVENT_CLIENT)
    private readonly client: ClientProxy,
  ) {
    super();
  }

  async publish<T extends object>(
    eventName: string,
    payload: T,
  ): Promise<void> {
    try {
      await firstValueFrom(this.client.emit(eventName, payload));
    } catch (error) {
      this.logger.error(
        `Failed to publish event ${eventName}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
