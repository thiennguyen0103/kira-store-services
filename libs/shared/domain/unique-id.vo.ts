import { validate as isUuid, v7 as uuidv7 } from 'uuid';
import { DomainException } from '../exceptions/domain.exception';
import { ValueObject } from './value-object';

export interface UniqueIdProps {
  value: string;
}

export abstract class UniqueId extends ValueObject<UniqueIdProps> {
  protected constructor(props: UniqueIdProps) {
    super(props);
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(other?: UniqueId): boolean {
    return !!other && this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  protected static generate(): string {
    return uuidv7();
  }

  protected static validate(value: string): void {
    if (!isUuid(value)) {
      throw new DomainException('Invalid UUID.', {
        code: 'INVALID_UUID',
      });
    }
  }
}
