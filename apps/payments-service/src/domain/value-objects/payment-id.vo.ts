import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class PaymentId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): PaymentId {
    const id = value ?? this.generate();
    this.validate(id);
    return new PaymentId(id);
  }

  public static restore(value: string): PaymentId {
    this.validate(value);
    return new PaymentId(value);
  }
}
