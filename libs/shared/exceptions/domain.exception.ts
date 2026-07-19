export class DomainException extends Error {
  public readonly code: string;

  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    options?: {
      code?: string;
      details?: Record<string, unknown>;
      cause?: Error;
    },
  ) {
    super(message, {
      cause: options?.cause,
    });

    this.name = this.constructor.name;

    this.code = options?.code ?? 'DOMAIN_ERROR';

    this.details = options?.details;

    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace?.(this, this.constructor);
  }
}
