import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfigOptions, productsServiceEnvSchema } from 'libs/shared/config';
import { ProductsGrpcController } from './presentation/products.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('products-service', productsServiceEnvSchema),
    ),
  ],
  controllers: [ProductsGrpcController],
  providers: [],
})
export class ProductsServiceModule {}
