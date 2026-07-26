import { HttpException, HttpStatus } from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';

export async function callGrpc<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw toHttpException(error);
  }
}

function toHttpException(error: unknown): HttpException {
  const grpcError = error as {
    code?: number;
    details?: string;
    message?: string;
  };
  const message =
    grpcError.details || grpcError.message || 'Products service error';

  switch (grpcError.code) {
    case GrpcStatus.ALREADY_EXISTS:
      return new HttpException(message, HttpStatus.CONFLICT);
    case GrpcStatus.UNAUTHENTICATED:
      return new HttpException(message, HttpStatus.UNAUTHORIZED);
    case GrpcStatus.PERMISSION_DENIED:
      return new HttpException(message, HttpStatus.FORBIDDEN);
    case GrpcStatus.INVALID_ARGUMENT:
      return new HttpException(message, HttpStatus.BAD_REQUEST);
    case GrpcStatus.NOT_FOUND:
      return new HttpException(message, HttpStatus.NOT_FOUND);
    case GrpcStatus.FAILED_PRECONDITION:
      return new HttpException(message, HttpStatus.PRECONDITION_FAILED);
    default:
      return new HttpException(message, HttpStatus.BAD_GATEWAY);
  }
}
