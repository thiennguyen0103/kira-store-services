import { Module } from '@nestjs/common';
import { PaymentsGrpcController } from './presentation/payments.grpc.controller';

@Module({
  imports: [],
  controllers: [PaymentsGrpcController],
  providers: [],
})
export class PaymentsServiceModule {}
