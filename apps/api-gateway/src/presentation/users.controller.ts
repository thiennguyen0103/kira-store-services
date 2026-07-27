import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
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
  MutationResponse,
  SearchUsersResponse,
  UserDetailResponse,
} from 'libs/shared/generated/users';
import { UsersClientPort } from '../application/ports/users-client.port';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './guards/auth.guard';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import {
  UpdateAvatarDto,
  UpdateProfileDto,
  UpsertAddressDto,
} from './dto/users-write.dto';
import { callGrpc } from './helpers/call-grpc.helper';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersClient: UsersClientPort) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({ description: 'Current user detail' })
  async getMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserDetailResponse> {
    return this.resolveCurrentUser(user.identityId);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update the authenticated user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ description: 'Profile updated' })
  async updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateProfileDto,
  ): Promise<MutationResponse> {
    const profile = await this.resolveCurrentUser(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.usersClient.updateProfile({
          userId: profile.id,
          firstName: body.firstName,
          lastName: body.lastName,
          phoneNumber: body.phoneNumber ?? '',
          gender: body.gender ?? '',
          birthday: body.birthday ?? '',
        }),
      ),
    );
  }

  @Put('me/avatar')
  @ApiOperation({ summary: 'Update the authenticated user avatar' })
  @ApiBody({ type: UpdateAvatarDto })
  @ApiOkResponse({ description: 'Avatar updated' })
  async updateMyAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateAvatarDto,
  ): Promise<MutationResponse> {
    const profile = await this.resolveCurrentUser(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.usersClient.updateAvatar({
          userId: profile.id,
          avatarUrl: body.avatarUrl,
        }),
      ),
    );
  }

  @Get('me/addresses')
  @ApiOperation({ summary: 'List addresses for the authenticated user' })
  @ApiOkResponse({ description: 'List of addresses' })
  async getMyAddresses(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GetAddressesResponse> {
    const profile = await this.resolveCurrentUser(user.identityId);
    return callGrpc(() =>
      firstValueFrom(this.usersClient.getAddresses({ userId: profile.id })),
    );
  }

  @Get('me/default-address')
  @ApiOperation({ summary: 'Get default address for the authenticated user' })
  @ApiOkResponse({ description: 'Default address' })
  async getMyDefaultAddress(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GetDefaultAddressResponse> {
    const profile = await this.resolveCurrentUser(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.usersClient.getDefaultAddress({ userId: profile.id }),
      ),
    );
  }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Add an address for the authenticated user' })
  @ApiBody({ type: UpsertAddressDto })
  @ApiOkResponse({ description: 'Address added' })
  async addMyAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpsertAddressDto,
  ): Promise<MutationResponse> {
    const profile = await this.resolveCurrentUser(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.usersClient.addAddress({
          userId: profile.id,
          firstName: body.firstName,
          lastName: body.lastName,
          phoneNumber: body.phoneNumber,
          provinceCode: body.provinceCode,
          districtCode: body.districtCode,
          districtName: body.districtName ?? '',
          wardCode: body.wardCode,
          addressLine: body.addressLine,
          postalCode: body.postalCode ?? '',
          label: body.label,
          isDefault: body.isDefault ?? false,
        }),
      ),
    );
  }

  @Put('me/addresses/:addressId')
  @ApiOperation({ summary: 'Update an address for the authenticated user' })
  @ApiParam({ name: 'addressId', description: 'Address id' })
  @ApiBody({ type: UpsertAddressDto })
  @ApiOkResponse({ description: 'Address updated' })
  async updateMyAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('addressId') addressId: string,
    @Body() body: UpsertAddressDto,
  ): Promise<MutationResponse> {
    const profile = await this.resolveCurrentUser(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.usersClient.updateAddress({
          userId: profile.id,
          addressId,
          firstName: body.firstName,
          lastName: body.lastName,
          phoneNumber: body.phoneNumber,
          provinceCode: body.provinceCode,
          districtCode: body.districtCode,
          districtName: body.districtName ?? '',
          wardCode: body.wardCode,
          addressLine: body.addressLine,
          postalCode: body.postalCode ?? '',
          label: body.label,
        }),
      ),
    );
  }

  @Delete('me/addresses/:addressId')
  @ApiOperation({ summary: 'Remove an address for the authenticated user' })
  @ApiParam({ name: 'addressId', description: 'Address id' })
  @ApiOkResponse({ description: 'Address removed' })
  async removeMyAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('addressId') addressId: string,
  ): Promise<MutationResponse> {
    const profile = await this.resolveCurrentUser(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.usersClient.removeAddress({
          userId: profile.id,
          addressId,
        }),
      ),
    );
  }

  @Put('me/addresses/:addressId/default')
  @ApiOperation({ summary: 'Set default address for the authenticated user' })
  @ApiParam({ name: 'addressId', description: 'Address id' })
  @ApiOkResponse({ description: 'Default address updated' })
  async setMyDefaultAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('addressId') addressId: string,
  ): Promise<MutationResponse> {
    const profile = await this.resolveCurrentUser(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.usersClient.setDefaultAddress({
          userId: profile.id,
          addressId,
        }),
      ),
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiOkResponse({ description: 'Paged list of matching users' })
  searchUsers(
    @Query() query: SearchUsersQueryDto,
  ): Promise<SearchUsersResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.usersClient.searchUsers({
          query: query.query ?? '',
          page: query.page ?? 1,
          limit: query.limit ?? 20,
        }),
      ),
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
    return callGrpc(() =>
      firstValueFrom(this.usersClient.getUserByIdentityId({ identityId })),
    );
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
    return callGrpc(() =>
      firstValueFrom(this.usersClient.getUser({ userId: id })),
    );
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
    return callGrpc(() =>
      firstValueFrom(this.usersClient.getAddresses({ userId: id })),
    );
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
    return callGrpc(() =>
      firstValueFrom(this.usersClient.getDefaultAddress({ userId: id })),
    );
  }

  private async resolveCurrentUser(
    identityId: string,
  ): Promise<UserDetailResponse> {
    const result = await callGrpc(() =>
      firstValueFrom(this.usersClient.getUserByIdentityId({ identityId })),
    );
    if (!result.user) {
      throw new NotFoundException('User profile not found for this account');
    }
    return result.user;
  }
}
