import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

const STATUS_BY_CODE: Record<string, number> = {
  MEDIA_ASSET_NOT_FOUND: HttpStatus.NOT_FOUND,
  MEDIA_ASSET_FORBIDDEN: HttpStatus.FORBIDDEN,
  MEDIA_ASSET_DELETED: HttpStatus.CONFLICT,
  INVALID_UPLOAD_PURPOSE: HttpStatus.BAD_REQUEST,
  INVALID_CONTENT_TYPE: HttpStatus.BAD_REQUEST,
  INVALID_CONTENT_LENGTH: HttpStatus.BAD_REQUEST,
  INVALID_UUID: HttpStatus.BAD_REQUEST,
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
