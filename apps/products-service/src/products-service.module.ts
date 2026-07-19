import { Module } from '@nestjs/common';
import { ProductsGrpcController } from './presentation/products.grpc.controller';

@Module({
  imports: [],
  controllers: [ProductsGrpcController],
  providers: [],
})
export class ProductsServiceModule {}
