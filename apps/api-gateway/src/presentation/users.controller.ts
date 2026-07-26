import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import type {
  GetAddressesResponse,
  GetDefaultAddressResponse,
  GetUserByIdentityIdResponse,
  SearchUsersResponse,
  UserDetailResponse,
} from 'libs/shared/generated/users';
import { UsersClientPort } from '../application/ports/users-client.port';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersClient: UsersClientPort) {}

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiOkResponse({ description: 'Paged list of matching users' })
  searchUsers(
    @Query() query: SearchUsersQueryDto,
  ): Promise<SearchUsersResponse> {
    return firstValueFrom(
      this.usersClient.searchUsers({
        query: query.query ?? '',
        page: query.page ?? 1,
        limit: query.limit ?? 20,
      }),
    );
  }

  @Get('identity/:identityId')
  @ApiOperation({ summary: 'Get user by identity id' })
  @ApiParam({
    name: 'identityId',
    description: 'Identity account id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ description: 'User linked to the identity id' })
  getUserByIdentityId(
    @Param('identityId') identityId: string,
  ): Promise<GetUserByIdentityIdResponse> {
    return firstValueFrom(this.usersClient.getUserByIdentityId({ identityId }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({
    name: 'id',
    description: 'User id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ description: 'User detail' })
  getUser(@Param('id') id: string): Promise<UserDetailResponse> {
    return firstValueFrom(this.usersClient.getUser({ userId: id }));
  }

  @Get(':id/addresses')
  @ApiOperation({ summary: 'Get user addresses' })
  @ApiParam({
    name: 'id',
    description: 'User id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ description: 'List of user addresses' })
  getAddresses(@Param('id') id: string): Promise<GetAddressesResponse> {
    return firstValueFrom(this.usersClient.getAddresses({ userId: id }));
  }

  @Get(':id/default-address')
  @ApiOperation({ summary: 'Get user default address' })
  @ApiParam({
    name: 'id',
    description: 'User id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ description: 'Default address for the user' })
  getDefaultAddress(
    @Param('id') id: string,
  ): Promise<GetDefaultAddressResponse> {
    return firstValueFrom(this.usersClient.getDefaultAddress({ userId: id }));
  }
}
