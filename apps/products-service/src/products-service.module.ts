import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfigOptions,
  createTypeOrmRootModule,
  productsServiceEnvSchema,
} from 'libs/shared/config';
import { createLoggerModule } from 'libs/shared/logging';
import { ProductsGrpcController } from './presentation/products.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('products-service', productsServiceEnvSchema),
    ),
    createLoggerModule('products-service'),
    createTypeOrmRootModule(),
  ],
  controllers: [ProductsGrpcController],
  providers: [],
})
export class ProductsServiceModule {}
