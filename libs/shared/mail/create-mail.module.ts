import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConsoleMailSender } from './console-mail.sender';
import { MailSender } from './mail-sender';
import { ResendMailSender } from './resend-mail.sender';

/**
 * Provides {@link MailSender} for any Nest app.
 * Uses Resend when `RESEND_API_KEY` is set; otherwise logs to the console.
 */
@Module({})
export class MailModule {
  static forRoot(): DynamicModule {
    return {
      module: MailModule,
      global: true,
      imports: [ConfigModule],
      providers: [
        {
          provide: MailSender,
          useFactory: (config: ConfigService): MailSender => {
            const apiKey = config.get<string>('RESEND_API_KEY')?.trim();
            if (apiKey) {
              return new ResendMailSender(config);
            }
            return new ConsoleMailSender();
          },
          inject: [ConfigService],
        },
      ],
      exports: [MailSender],
    };
  }
}
