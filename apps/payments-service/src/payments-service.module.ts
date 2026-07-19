import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfigOptions, paymentsServiceEnvSchema } from 'libs/shared/config';
import { PaymentsGrpcController } from './presentation/payments.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('payments-service', paymentsServiceEnvSchema),
    ),
  ],
  controllers: [PaymentsGrpcController],
  providers: [],
})
export class PaymentsServiceModule {}
