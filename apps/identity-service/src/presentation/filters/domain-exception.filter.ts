import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

const STATUS_BY_CODE: Record<string, number> = {
  EMAIL_ALREADY_EXISTS: HttpStatus.CONFLICT,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  EMAIL_NOT_VERIFIED: HttpStatus.FORBIDDEN,
  ACCOUNT_LOCKED: HttpStatus.FORBIDDEN,
  ACCOUNT_DISABLED: HttpStatus.FORBIDDEN,
  ACCOUNT_INACTIVE: HttpStatus.FORBIDDEN,
  INVALID_REFRESH_TOKEN: HttpStatus.UNAUTHORIZED,
  REFRESH_TOKEN_REUSE: HttpStatus.UNAUTHORIZED,
  REFRESH_TOKEN_EXPIRED: HttpStatus.UNAUTHORIZED,
  INVALID_VERIFICATION_TOKEN: HttpStatus.BAD_REQUEST,
  INVALID_RESET_TOKEN: HttpStatus.BAD_REQUEST,
  INVALID_EMAIL: HttpStatus.BAD_REQUEST,
  INVALID_PASSWORD: HttpStatus.BAD_REQUEST,
  INVALID_NAME: HttpStatus.BAD_REQUEST,
};

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = STATUS_BY_CODE[exception.code] ?? HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
      details: exception.details,
    });
  }
}
