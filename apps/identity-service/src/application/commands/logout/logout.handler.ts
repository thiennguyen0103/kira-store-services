import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { TokenService } from '../../ports/token-service.port';
import { LogoutCommand } from './logout.command';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly refreshTokens: RefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LogoutCommand): Promise<{ success: boolean }> {
    const tokenHash = this.tokenService.hashOpaqueToken(command.refreshToken);
    const existing = await this.refreshTokens.findByTokenHash(tokenHash);

    if (existing && !existing.isRevoked) {
      existing.revoke();
      await this.refreshTokens.save(existing);
    }

    return { success: true };
  }
}
