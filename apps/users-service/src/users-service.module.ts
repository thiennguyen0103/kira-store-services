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
import { AddAddressHandler } from './application/commands/add-address/add-address.handler';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { RemoveAddressHandler } from './application/commands/remove-address/remove-address.handler';
import { SetDefaultAddressHandler } from './application/commands/set-default-address/set-default-address.handler';
import { UpdateAddressHandler } from './application/commands/update-address/update-address.handler';
import { UpdateAvatarHandler } from './application/commands/update-avatar/update-avatar.handler';
import { UpdateProfileHandler } from './application/commands/update-profile/update-profile.handler';
import { GetUserHandler } from './application/queries/get-user/get-user.handler';
import { UserQueryRepository } from './application/queries/repositories/user-query.repository';
import { TypeOrmUserQueryRepository } from './infrastructure/persistence/repositories/typeorm-user-query.repository';
import { AddressOrmEntity } from './infrastructure/persistence/entities/address.entity';
import { UserOrmEntity } from './infrastructure/persistence/entities/user.entity';
import { UserGrpcController } from './presentation/grpc/users.grpc.controller';
import { UsersHttpController } from './presentation/users.http.controller';
import { GetAddressesHandler } from './application/queries/get-addresses/get-addresses.handler';
import { GetDefaultAddressHandler } from './application/queries/get-default-addresses/get-default.address.handler';
import { GetUserByIdentityIdHandler } from './application/queries/get-user-by-identity-id/get-user-by-identity-id.handler';
import { SearchUsersHandler } from './application/queries/search-users/search-users.handler';
import { UserPersistenceMapper } from './infrastructure/persistence/mappers/user-persistence.mapper';
import { UserRepository } from './domain/repositories/user.repository';
import { TypeOrmUserRepository } from './infrastructure/persistence/repositories/typeorm-user.repository';
import { UserRegisteredConsumer } from './infrastructure/messaging/user-registered.consumer';

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
  controllers: [
    UserGrpcController,
    UsersHttpController,
    UserRegisteredConsumer,
  ],
  providers: [
    CreateUserHandler,
    AddAddressHandler,
    UpdateAddressHandler,
    RemoveAddressHandler,
    SetDefaultAddressHandler,
    UpdateProfileHandler,
    UpdateAvatarHandler,
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
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
  ],
})
export class UsersServiceModule {}
