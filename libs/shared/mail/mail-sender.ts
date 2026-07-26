export interface SendMailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Cross-service mail transport. Domain-specific templates stay in each app;
 * inject this port and call `send`.
 */
export abstract class MailSender {
  abstract send(params: SendMailParams): Promise<void>;
}
