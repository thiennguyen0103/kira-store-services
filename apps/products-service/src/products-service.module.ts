import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfigOptions,
  createTypeOrmRootModule,
  productsServiceEnvSchema,
} from 'libs/shared/config';
import { ProductsGrpcController } from './presentation/products.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('products-service', productsServiceEnvSchema),
    ),
    createTypeOrmRootModule(),
  ],
  controllers: [ProductsGrpcController],
  providers: [],
})
export class ProductsServiceModule {}
