import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { NotFoundException } from 'libs/shared/exceptions/not-found.exception';

@Catch(NotFoundException)
export class DomainNotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      throw exception;
    }

    const response = host.switchToHttp().getResponse<Response>();
    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      code: exception.code,
      message: exception.message,
    });
  }
}
