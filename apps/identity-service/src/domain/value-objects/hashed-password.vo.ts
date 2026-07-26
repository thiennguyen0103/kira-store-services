import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { ValueObject } from 'libs/shared/domain/value-object';

export interface HashedPasswordProps {
  value: string;
}

export class HashedPassword extends ValueObject<HashedPasswordProps> {
  private constructor(props: HashedPasswordProps) {
    super(props);
  }

  public static create(hash: string): HashedPassword {
    if (!hash) {
      throw new DomainException('Password hash is required.', {
        code: 'INVALID_PASSWORD_HASH',
      });
    }

    return new HashedPassword({ value: hash });
  }

  public static restore(hash: string): HashedPassword {
    return new HashedPassword({ value: hash });
  }

  public get value(): string {
    return this.props.value;
  }
}
