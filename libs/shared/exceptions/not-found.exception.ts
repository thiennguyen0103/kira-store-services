import { DomainException } from './domain.exception';

export abstract class NotFoundException extends DomainException {
  protected constructor(resource: string, identifier?: string) {
    super(
      identifier
        ? `${resource} '${identifier}' was not found.`
        : `${resource} was not found.`,
      {
        code: `${resource.toUpperCase().replace(/\s+/g, '_')}_NOT_FOUND`,
      },
    );
  }
}
