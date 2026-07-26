import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface VariantOptionsProps {
  values: Readonly<Record<string, string>>;
}

export class VariantOptions extends ValueObject<VariantOptionsProps> {
  private static readonly MAX_KEYS = 20;
  private static readonly MAX_KEY_LENGTH = 50;
  private static readonly MAX_VALUE_LENGTH = 100;

  private constructor(props: VariantOptionsProps) {
    super(props);
  }

  public static create(raw: Record<string, string>): VariantOptions {
    const entries = Object.entries(raw ?? {});

    if (entries.length > this.MAX_KEYS) {
      throw new DomainException('Too many variant options.', {
        code: 'TOO_MANY_VARIANT_OPTIONS',
      });
    }

    const values: Record<string, string> = {};

    for (const [rawKey, rawValue] of entries) {
      const key = rawKey.trim().toLowerCase();
      const value = rawValue.trim();

      if (!key) {
        throw new DomainException('Variant option key cannot be empty.', {
          code: 'INVALID_VARIANT_OPTION_KEY',
        });
      }

      if (key.length > this.MAX_KEY_LENGTH) {
        throw new DomainException('Variant option key is too long.', {
          code: 'VARIANT_OPTION_KEY_TOO_LONG',
        });
      }

      if (!value) {
        throw new DomainException('Variant option value cannot be empty.', {
          code: 'INVALID_VARIANT_OPTION_VALUE',
        });
      }

      if (value.length > this.MAX_VALUE_LENGTH) {
        throw new DomainException('Variant option value is too long.', {
          code: 'VARIANT_OPTION_VALUE_TOO_LONG',
        });
      }

      values[key] = value;
    }

    return new VariantOptions({ values });
  }

  public static empty(): VariantOptions {
    return new VariantOptions({ values: {} });
  }

  public static restore(values: Record<string, string>): VariantOptions {
    return new VariantOptions({ values: { ...values } });
  }

  public get values(): Readonly<Record<string, string>> {
    return this.props.values;
  }

  public get(key: string): string | undefined {
    return this.props.values[key.trim().toLowerCase()];
  }
}
