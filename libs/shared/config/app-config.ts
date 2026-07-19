import { join } from 'node:path';
import type { ConfigModuleOptions } from '@nestjs/config';
import type { ObjectSchema } from 'joi';

export function appConfigOptions(
  appName: string,
  validationSchema: ObjectSchema,
): ConfigModuleOptions {
  return {
    isGlobal: true,
    cache: true,
    envFilePath: [
      join(process.cwd(), 'apps', appName, '.env'),
      join(process.cwd(), '.env'),
    ],
    validationSchema,
    validationOptions: {
      abortEarly: false,
      allowUnknown: true,
    },
  };
}
