import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

const STATUS_BY_CODE: Record<string, number> = {
  DUPLICATE_SLUG: HttpStatus.CONFLICT,
  DUPLICATE_SKU: HttpStatus.CONFLICT,
  INSUFFICIENT_STOCK: HttpStatus.CONFLICT,
  PRODUCT_CANNOT_PUBLISH: HttpStatus.BAD_REQUEST,
  INVALID_CATEGORY: HttpStatus.BAD_REQUEST,
};

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      STATUS_BY_CODE[exception.code] ??
      (exception.code.endsWith('_NOT_FOUND')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST);

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
      details: exception.details,
    });
  }
}
