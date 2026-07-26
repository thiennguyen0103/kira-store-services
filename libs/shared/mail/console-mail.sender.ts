import { Injectable, Logger } from '@nestjs/common';
import { MailSender, SendMailParams } from './mail-sender';

@Injectable()
export class ConsoleMailSender extends MailSender {
  private readonly logger = new Logger(ConsoleMailSender.name);

  send(params: SendMailParams): Promise<void> {
    const to = Array.isArray(params.to) ? params.to.join(', ') : params.to;
    this.logger.log(
      `[DEV EMAIL] to=${to} subject="${params.subject}" text=${params.text ?? params.html}`,
    );
    return Promise.resolve();
  }
}
