import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface ShippingAddressProps {
  addressId: string;
  receiverName: string;
  phoneNumber: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  addressLine: string;
  postalCode: string;
}

export class ShippingAddress extends ValueObject<ShippingAddressProps> {
  private constructor(props: ShippingAddressProps) {
    super(props);
  }

  public static create(props: ShippingAddressProps): ShippingAddress {
    if (!props.addressId?.trim()) {
      throw new DomainException('Address id is required.', {
        code: 'INVALID_SHIPPING_ADDRESS',
      });
    }
    if (!props.receiverName?.trim()) {
      throw new DomainException('Receiver name is required.', {
        code: 'INVALID_SHIPPING_ADDRESS',
      });
    }
    if (!props.phoneNumber?.trim()) {
      throw new DomainException('Phone number is required.', {
        code: 'INVALID_SHIPPING_ADDRESS',
      });
    }
    if (!props.addressLine?.trim()) {
      throw new DomainException('Address line is required.', {
        code: 'INVALID_SHIPPING_ADDRESS',
      });
    }
    return new ShippingAddress({
      addressId: props.addressId.trim(),
      receiverName: props.receiverName.trim(),
      phoneNumber: props.phoneNumber.trim(),
      provinceCode: props.provinceCode?.trim() ?? '',
      districtCode: props.districtCode?.trim() ?? '',
      wardCode: props.wardCode?.trim() ?? '',
      addressLine: props.addressLine.trim(),
      postalCode: props.postalCode?.trim() ?? '',
    });
  }

  public static restore(props: ShippingAddressProps): ShippingAddress {
    return new ShippingAddress(props);
  }

  public get addressId(): string {
    return this.props.addressId;
  }

  public get receiverName(): string {
    return this.props.receiverName;
  }

  public get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  public get provinceCode(): string {
    return this.props.provinceCode;
  }

  public get districtCode(): string {
    return this.props.districtCode;
  }

  public get wardCode(): string {
    return this.props.wardCode;
  }

  public get addressLine(): string {
    return this.props.addressLine;
  }

  public get postalCode(): string {
    return this.props.postalCode;
  }
}
