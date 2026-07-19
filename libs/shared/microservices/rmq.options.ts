import { Transport, type RmqOptions } from '@nestjs/microservices';

export const DEFAULT_RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';

export function getRabbitMqUrl(): string {
  return process.env.RABBITMQ_URL ?? DEFAULT_RABBITMQ_URL;
}

export function createRmqOptions(queue: string): RmqOptions {
  return {
    transport: Transport.RMQ,
    options: {
      urls: [getRabbitMqUrl()],
      queue,
      queueOptions: {
        durable: true,
      },
    },
  };
}
