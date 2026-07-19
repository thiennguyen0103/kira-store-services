import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfigOptions,
  createTypeOrmRootModule,
  paymentsServiceEnvSchema,
} from 'libs/shared/config';
import { createLoggerModule } from 'libs/shared/logging';
import { PaymentsGrpcController } from './presentation/payments.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('payments-service', paymentsServiceEnvSchema),
    ),
    createLoggerModule('payments-service'),
    createTypeOrmRootModule(),
  ],
  controllers: [PaymentsGrpcController],
  providers: [],
})
export class PaymentsServiceModule {}
