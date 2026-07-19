import type { INestApplication } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

export function setupLogger(app: INestApplication): void {
  app.useLogger(app.get(Logger));
}
