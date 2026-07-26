import { DomainException } from 'libs/shared/exceptions/domain.exception';

export class DuplicateSlugException extends DomainException {
  constructor(slug: string) {
    super(`Slug '${slug}' already exists.`, {
      code: 'DUPLICATE_SLUG',
      details: { slug },
    });
  }
}
