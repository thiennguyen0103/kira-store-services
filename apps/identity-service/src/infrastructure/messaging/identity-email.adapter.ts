import { Injectable } from '@nestjs/common';
import { MailSender } from 'libs/shared/mail';
import { EmailPort } from '../../application/ports/email.port';

/**
 * Identity-specific templates on top of the shared {@link MailSender} transport.
 */
@Injectable()
export class IdentityEmailAdapter extends EmailPort {
  constructor(private readonly mail: MailSender) {
    super();
  }

  async sendEmailVerification(params: {
    to: string;
    firstName: string;
    verifyUrl: string;
  }): Promise<void> {
    await this.mail.send({
      to: params.to,
      subject: 'Verify your email',
      html: this.verificationHtml(params.firstName, params.verifyUrl),
      text: `Hi ${params.firstName},\n\nVerify your email by opening this link:\n${params.verifyUrl}\n\nIf you did not create an account, you can ignore this email.`,
    });
  }

  async sendPasswordReset(params: {
    to: string;
    firstName: string;
    resetUrl: string;
  }): Promise<void> {
    await this.mail.send({
      to: params.to,
      subject: 'Reset your password',
      html: this.resetHtml(params.firstName, params.resetUrl),
      text: `Hi ${params.firstName},\n\nReset your password by opening this link:\n${params.resetUrl}\n\nThis link expires in 1 hour. If you did not request a reset, you can ignore this email.`,
    });
  }

  private verificationHtml(firstName: string, verifyUrl: string): string {
    return `
      <p>Hi ${this.escape(firstName)},</p>
      <p>Thanks for signing up. Please verify your email address:</p>
      <p><a href="${this.escape(verifyUrl)}">Verify email</a></p>
      <p>Or copy this link: ${this.escape(verifyUrl)}</p>
      <p>If you did not create an account, you can ignore this email.</p>
    `.trim();
  }

  private resetHtml(firstName: string, resetUrl: string): string {
    return `
      <p>Hi ${this.escape(firstName)},</p>
      <p>We received a request to reset your password:</p>
      <p><a href="${this.escape(resetUrl)}">Reset password</a></p>
      <p>Or copy this link: ${this.escape(resetUrl)}</p>
      <p>This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>
    `.trim();
  }

  private escape(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
