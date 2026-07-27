import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.code.endsWith('_NOT_FOUND')
      ? HttpStatus.NOT_FOUND
      : HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
      details: exception.details,
    });
  }
}
