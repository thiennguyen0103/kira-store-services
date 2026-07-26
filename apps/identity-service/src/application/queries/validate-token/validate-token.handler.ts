import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TokenService } from '../../ports/token-service.port';
import { ValidateTokenQuery } from './validate-token.query';

export interface ValidateTokenResult {
  valid: boolean;
  identityId: string;
  email: string;
  role: string;
  status: string;
}

@QueryHandler(ValidateTokenQuery)
export class ValidateTokenHandler implements IQueryHandler<ValidateTokenQuery> {
  constructor(private readonly tokenService: TokenService) {}

  async execute(query: ValidateTokenQuery): Promise<ValidateTokenResult> {
    const payload = await this.tokenService.verifyAccessToken(
      query.accessToken,
    );

    if (!payload) {
      return {
        valid: false,
        identityId: '',
        email: '',
        role: '',
        status: '',
      };
    }

    return {
      valid: true,
      identityId: payload.sub,
      email: payload.email,
      role: payload.role,
      status: payload.status,
    };
  }
}
