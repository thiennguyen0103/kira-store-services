import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  AuthTokensResponseDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  LogoutRequestDto,
  LogoutResponseDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
  RegisterResponseDto,
  ResetPasswordRequestDto,
  SuccessMessageResponseDto,
  ValidateTokenRequestDto,
  ValidateTokenResponseDto,
  VerifyEmailQueryDto,
} from 'libs/shared/dto/auth';
import { ForgotPasswordCommand } from '../application/commands/forgot-password/forgot-password.command';
import { LoginCommand } from '../application/commands/login/login.command';
import { LogoutCommand } from '../application/commands/logout/logout.command';
import { RefreshTokenCommand } from '../application/commands/refresh-token/refresh-token.command';
import { RegisterCommand } from '../application/commands/register/register.command';
import { ResetPasswordCommand } from '../application/commands/reset-password/reset-password.command';
import { VerifyEmailCommand } from '../application/commands/verify-email/verify-email.command';
import type {
  AuthTokensResult,
  RegisterResult,
} from '../application/dto/auth-result.dto';
import { ValidateTokenQuery } from '../application/queries/validate-token/validate-token.query';
import type { ValidateTokenResult } from '../application/queries/validate-token/validate-token.handler';

@ApiTags('auth')
@Controller('auth')
export class IdentityHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiBody({ type: RegisterRequestDto })
  @ApiOkResponse({ type: RegisterResponseDto })
  register(@Body() body: RegisterRequestDto): Promise<RegisterResult> {
    return this.commandBus.execute(
      new RegisterCommand(
        body.email,
        body.password,
        body.firstName,
        body.lastName,
      ),
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  login(@Body() body: LoginRequestDto): Promise<AuthTokensResult> {
    return this.commandBus.execute(new LoginCommand(body.email, body.password));
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token' })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  refresh(@Body() body: RefreshTokenRequestDto): Promise<AuthTokensResult> {
    return this.commandBus.execute(new RefreshTokenCommand(body.refreshToken));
  }

  @Post('logout')
  @ApiOperation({ summary: 'Revoke refresh token' })
  @ApiBody({ type: LogoutRequestDto })
  @ApiOkResponse({ type: LogoutResponseDto })
  logout(@Body() body: LogoutRequestDto): Promise<{ success: boolean }> {
    return this.commandBus.execute(new LogoutCommand(body.refreshToken));
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email and issue tokens' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  verifyEmail(@Query() query: VerifyEmailQueryDto): Promise<AuthTokensResult> {
    return this.commandBus.execute(new VerifyEmailCommand(query.token));
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordRequestDto })
  @ApiOkResponse({ type: SuccessMessageResponseDto })
  forgotPassword(
    @Body() body: ForgotPasswordRequestDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.commandBus.execute(new ForgotPasswordCommand(body.email));
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiBody({ type: ResetPasswordRequestDto })
  @ApiOkResponse({ type: SuccessMessageResponseDto })
  resetPassword(
    @Body() body: ResetPasswordRequestDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.commandBus.execute(
      new ResetPasswordCommand(body.token, body.newPassword),
    );
  }

  @Post('validate-token')
  @ApiOperation({ summary: 'Validate access token' })
  @ApiBody({ type: ValidateTokenRequestDto })
  @ApiOkResponse({ type: ValidateTokenResponseDto })
  validateToken(
    @Body() body: ValidateTokenRequestDto,
  ): Promise<ValidateTokenResult> {
    return this.queryBus.execute(new ValidateTokenQuery(body.accessToken));
  }
}
