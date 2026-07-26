import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
  register(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
  ): Promise<RegisterResult> {
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
  login(
    @Body() body: { email: string; password: string },
  ): Promise<AuthTokensResult> {
    return this.commandBus.execute(new LoginCommand(body.email, body.password));
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token' })
  refresh(@Body() body: { refreshToken: string }): Promise<AuthTokensResult> {
    return this.commandBus.execute(new RefreshTokenCommand(body.refreshToken));
  }

  @Post('logout')
  @ApiOperation({ summary: 'Revoke refresh token' })
  logout(
    @Body() body: { refreshToken: string },
  ): Promise<{ success: boolean }> {
    return this.commandBus.execute(new LogoutCommand(body.refreshToken));
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email and issue tokens' })
  verifyEmail(@Query('token') token: string): Promise<AuthTokensResult> {
    return this.commandBus.execute(new VerifyEmailCommand(token));
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset email' })
  forgotPassword(
    @Body() body: { email: string },
  ): Promise<{ success: boolean; message: string }> {
    return this.commandBus.execute(new ForgotPasswordCommand(body.email));
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  resetPassword(
    @Body() body: { token: string; newPassword: string },
  ): Promise<{ success: boolean; message: string }> {
    return this.commandBus.execute(
      new ResetPasswordCommand(body.token, body.newPassword),
    );
  }

  @Post('validate-token')
  @ApiOperation({ summary: 'Validate access token' })
  validateToken(
    @Body() body: { accessToken: string },
  ): Promise<ValidateTokenResult> {
    return this.queryBus.execute(new ValidateTokenQuery(body.accessToken));
  }
}
