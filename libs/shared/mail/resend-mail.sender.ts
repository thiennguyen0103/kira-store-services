import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { MailSender, SendMailParams } from './mail-sender';

@Injectable()
export class ResendMailSender extends MailSender {
  private readonly logger = new Logger(ResendMailSender.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor(config: ConfigService) {
    super();
    this.resend = new Resend(config.getOrThrow<string>('RESEND_API_KEY'));
    this.from = config.getOrThrow<string>('EMAIL_FROM');
  }

  async send(params: SendMailParams): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      this.logger.error(
        `Failed to send email "${params.subject}" to ${String(params.to)}`,
        error,
      );
      throw new Error(`Failed to send email: ${error.message}`);
    }

    this.logger.log(`Email "${params.subject}" sent to ${String(params.to)}`);
  }
}
