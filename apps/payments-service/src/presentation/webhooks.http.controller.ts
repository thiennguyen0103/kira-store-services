import {
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  type RawBodyRequest,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { ProcessWebhookCommand } from 'apps/payments-service/src/application/commands/process-webhook/process-webhook.command';
import { PaymentProvider } from 'libs/shared/enums';

@Controller()
export class WebhooksHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('webhooks/stripe')
  @HttpCode(200)
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ): Promise<{ received: boolean }> {
    await this.commandBus.execute(
      new ProcessWebhookCommand(
        PaymentProvider.STRIPE,
        this.resolveRawBody(req),
        headers,
      ),
    );
    return { received: true };
  }

  @Post('webhooks/payos')
  @HttpCode(200)
  async payosWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ): Promise<{ received: boolean }> {
    await this.commandBus.execute(
      new ProcessWebhookCommand(
        PaymentProvider.PAYOS,
        this.resolveRawBody(req),
        headers,
      ),
    );
    return { received: true };
  }

  private resolveRawBody(req: RawBodyRequest<Request>): Buffer | string {
    if (req.rawBody) {
      return req.rawBody;
    }

    if (Buffer.isBuffer(req.body)) {
      return req.body;
    }

    if (typeof req.body === 'string') {
      return req.body;
    }

    return JSON.stringify(req.body ?? {});
  }
}
