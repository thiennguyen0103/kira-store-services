import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import type {
  GetAddressesResponse,
  GetDefaultAddressResponse,
  GetUserByIdentityIdResponse,
  SearchUsersResponse,
  UserDetailResponse,
} from 'libs/shared/generated/users';
import { UsersClientPort } from '../application/ports/users-client.port';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersClient: UsersClientPort) {}

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  searchUsers(
    @Query('query') query = '',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<SearchUsersResponse> {
    return firstValueFrom(
      this.usersClient.searchUsers({
        query,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      }),
    );
  }

  @Get('identity/:identityId')
  @ApiOperation({ summary: 'Get user by identity id' })
  getUserByIdentityId(
    @Param('identityId') identityId: string,
  ): Promise<GetUserByIdentityIdResponse> {
    return firstValueFrom(this.usersClient.getUserByIdentityId({ identityId }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  getUser(@Param('id') id: string): Promise<UserDetailResponse> {
    return firstValueFrom(this.usersClient.getUser({ userId: id }));
  }

  @Get(':id/addresses')
  @ApiOperation({ summary: 'Get user addresses' })
  getAddresses(@Param('id') id: string): Promise<GetAddressesResponse> {
    return firstValueFrom(this.usersClient.getAddresses({ userId: id }));
  }

  @Get(':id/default-address')
  @ApiOperation({ summary: 'Get user default address' })
  getDefaultAddress(
    @Param('id') id: string,
  ): Promise<GetDefaultAddressResponse> {
    return firstValueFrom(this.usersClient.getDefaultAddress({ userId: id }));
  }
}
