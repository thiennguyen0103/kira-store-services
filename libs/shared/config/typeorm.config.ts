import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { DynamicModule } from '@nestjs/common';

export function createTypeOrmRootModule(): DynamicModule {
  return TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
      type: 'postgres',
      host: config.getOrThrow<string>('DB_HOST'),
      port: config.getOrThrow<number>('DB_PORT'),
      username: config.getOrThrow<string>('DB_USERNAME'),
      password: config.getOrThrow<string>('DB_PASSWORD'),
      database: config.getOrThrow<string>('DB_NAME'),
      autoLoadEntities: true,
      synchronize: config.get<string>('NODE_ENV') !== 'production',
    }),
  });
}
