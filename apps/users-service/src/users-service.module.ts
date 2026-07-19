import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  appConfigOptions,
  createTypeOrmRootModule,
  usersServiceEnvSchema,
} from 'libs/shared/config';
import { createLoggerModule } from 'libs/shared/logging';
import { GetUserHandler } from './application/queries/get-user/get-user.handler';
import { UserQueryRepository } from './application/queries/repositories/user-query.repository';
import { TypeOrmUserQueryRepository } from './infrastructure/persistence/repositories/typeorm-user-query.repository';
import { AddressOrmEntity } from './infrastructure/persistence/entities/address.entity';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.entity';
import { UserGrpcController } from './presentation/grpc/users.grpc.controller';
import { UsersController } from './presentation/grpc/users.controller';
import { GetAddressesHandler } from './application/queries/get-addresses/get-addresses.handler';
import { GetDefaultAddressHandler } from './application/queries/get-default-addresses/get-default.address.handler';
import { GetUserByIdentityIdHandler } from './application/queries/get-user-by-identity-id/get-user-by-identity-id.handler';
import { SearchUsersHandler } from './application/queries/search-users/search-users.handler';
import { UserPersistenceMapper } from './infrastructure/persistence/mappers/user-persistence.mapper';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('users-service', usersServiceEnvSchema),
    ),
    createLoggerModule('users-service'),
    createTypeOrmRootModule(),
    TypeOrmModule.forFeature([UserOrmEntity, AddressOrmEntity]),
    CqrsModule.forRoot(),
  ],
  controllers: [UserGrpcController, UsersController],
  providers: [
    GetUserHandler,
    GetAddressesHandler,
    GetDefaultAddressHandler,
    GetUserByIdentityIdHandler,
    SearchUsersHandler,
    UserPersistenceMapper,
    {
      provide: UserQueryRepository,
      useClass: TypeOrmUserQueryRepository,
    },
  ],
})
export class UsersServiceModule {}
