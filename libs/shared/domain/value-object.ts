import equal from 'fast-deep-equal';

export abstract class ValueObject<T> {
  protected readonly props: Readonly<T>;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(valueObject?: ValueObject<T>): boolean {
    if (!valueObject) {
      return false;
    }

    return equal(this.props, valueObject.props);
  }
}
