import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

const STATUS_BY_CODE: Record<string, number> = {
  INVALID_ORDER_TRANSITION: HttpStatus.CONFLICT,
  EMPTY_CART: HttpStatus.BAD_REQUEST,
  EMPTY_ORDER: HttpStatus.BAD_REQUEST,
  CART_ITEM_NOT_FOUND: HttpStatus.NOT_FOUND,
  PRODUCT_UNAVAILABLE: HttpStatus.CONFLICT,
  INSUFFICIENT_STOCK: HttpStatus.CONFLICT,
  VARIANT_NOT_FOUND: HttpStatus.NOT_FOUND,
  ADDRESS_NOT_FOUND: HttpStatus.NOT_FOUND,
  STOCK_RESERVATION_FAILED: HttpStatus.CONFLICT,
  PAYMENT_INTENT_FAILED: HttpStatus.BAD_GATEWAY,
  PAYMENT_REFUND_FAILED: HttpStatus.BAD_GATEWAY,
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
