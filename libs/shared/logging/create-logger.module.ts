import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import type { TransportTargetOptions } from 'pino';

export function createLoggerModule(serviceName: string) {
  return LoggerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      const isProduction = config.get<string>('NODE_ENV') === 'production';
      const level = config.get<string>('LOG_LEVEL', 'info');
      const lokiUrl = config.get<string>('LOKI_URL');
      const nodeEnv = config.get<string>('NODE_ENV', 'development');

      const targets: TransportTargetOptions[] = [];

      if (!isProduction) {
        targets.push({
          target: 'pino-pretty',
          level,
          options: {
            singleLine: true,
            colorize: true,
            translateTime: 'SYS:standard',
          },
        });
      } else {
        targets.push({
          target: 'pino/file',
          level,
          options: { destination: 1 },
        });
      }

      if (lokiUrl) {
        targets.push({
          target: 'pino-loki',
          level,
          options: {
            host: lokiUrl,
            batching: { interval: 5 },
            labels: {
              service: serviceName,
              env: nodeEnv,
            },
            propsToLabels: ['context', 'reqId'],
          },
        });
      }

      return {
        pinoHttp: {
          level,
          base: { service: serviceName },
          transport: { targets },
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'password',
              'DB_PASSWORD',
            ],
            remove: true,
          },
          autoLogging: true,
          quietReqLogger: true,
        },
      };
    },
  });
}
