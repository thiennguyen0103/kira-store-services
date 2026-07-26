import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  appConfigOptions,
  createTypeOrmRootModule,
  identityServiceEnvSchema,
} from 'libs/shared/config';
import { QUEUE_NAMES } from 'libs/shared/constants';
import { EventPublisher } from 'libs/shared/interfaces';
import { createLoggerModule } from 'libs/shared/logging';
import { MailModule } from 'libs/shared/mail';
import { getRabbitMqUrl } from 'libs/shared/microservices';
import { ForgotPasswordHandler } from './application/commands/forgot-password/forgot-password.handler';
import { LoginHandler } from './application/commands/login/login.handler';
import { LogoutHandler } from './application/commands/logout/logout.handler';
import { RefreshTokenHandler } from './application/commands/refresh-token/refresh-token.handler';
import { RegisterHandler } from './application/commands/register/register.handler';
import { ResetPasswordHandler } from './application/commands/reset-password/reset-password.handler';
import { VerifyEmailHandler } from './application/commands/verify-email/verify-email.handler';
import { EmailPort } from './application/ports/email.port';
import { PasswordHasher } from './application/ports/password-hasher.port';
import { TokenService } from './application/ports/token-service.port';
import { ValidateTokenHandler } from './application/queries/validate-token/validate-token.handler';
import { IdentityRepository } from './domain/repositories/identity.repository';
import { RefreshTokenRepository } from './domain/repositories/refresh-token.repository';
import { VerificationTokenRepository } from './domain/repositories/verification-token.repository';
import { IdentityEmailAdapter } from './infrastructure/messaging/identity-email.adapter';
import {
  IDENTITY_EVENT_CLIENT,
  RmqEventPublisher,
} from './infrastructure/messaging/rmq-event.publisher';
import { EmailVerificationTokenOrmEntity } from './infrastructure/persistence/entities/email-verification-token.orm-entity';
import { IdentityAccountOrmEntity } from './infrastructure/persistence/entities/identity-account.orm-entity';
import { PasswordResetTokenOrmEntity } from './infrastructure/persistence/entities/password-reset-token.orm-entity';
import { RefreshTokenOrmEntity } from './infrastructure/persistence/entities/refresh-token.orm-entity';
import { IdentityPersistenceMapper } from './infrastructure/persistence/mappers/identity-persistence.mapper';
import { TypeOrmIdentityRepository } from './infrastructure/persistence/repositories/typeorm-identity.repository';
import { TypeOrmRefreshTokenRepository } from './infrastructure/persistence/repositories/typeorm-refresh-token.repository';
import { TypeOrmVerificationTokenRepository } from './infrastructure/persistence/repositories/typeorm-verification-token.repository';
import { Argon2PasswordHasher } from './infrastructure/security/argon2-password-hasher';
import { JwtTokenService } from './infrastructure/security/jwt-token.service';
import { IdentityGrpcController } from './presentation/identity.grpc.controller';
import { IdentityHttpController } from './presentation/identity.http.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('identity-service', identityServiceEnvSchema),
    ),
    createLoggerModule('identity-service'),
    MailModule.forRoot(),
    createTypeOrmRootModule(),
    TypeOrmModule.forFeature([
      IdentityAccountOrmEntity,
      RefreshTokenOrmEntity,
      EmailVerificationTokenOrmEntity,
      PasswordResetTokenOrmEntity,
    ]),
    CqrsModule.forRoot(),
    JwtModule.register({}),
    ClientsModule.registerAsync([
      {
        name: IDENTITY_EVENT_CLIENT,
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [getRabbitMqUrl()],
            queue: QUEUE_NAMES.USERS,
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [IdentityGrpcController, IdentityHttpController],
  providers: [
    RegisterHandler,
    LoginHandler,
    RefreshTokenHandler,
    LogoutHandler,
    VerifyEmailHandler,
    ForgotPasswordHandler,
    ResetPasswordHandler,
    ValidateTokenHandler,
    IdentityPersistenceMapper,
    { provide: IdentityRepository, useClass: TypeOrmIdentityRepository },
    {
      provide: RefreshTokenRepository,
      useClass: TypeOrmRefreshTokenRepository,
    },
    {
      provide: VerificationTokenRepository,
      useClass: TypeOrmVerificationTokenRepository,
    },
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
    { provide: TokenService, useClass: JwtTokenService },
    { provide: EmailPort, useClass: IdentityEmailAdapter },
    { provide: EventPublisher, useClass: RmqEventPublisher },
  ],
})
export class IdentityServiceModule {}
