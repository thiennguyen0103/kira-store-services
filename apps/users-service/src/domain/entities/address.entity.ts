import { AggregateRoot } from 'libs/shared/domain/aggregate-root';
import { EAddressLabel } from '../enums/address-label.enum';
import { AddressLine } from '../value-objects/address/address-line.vo';
import { District } from '../value-objects/address/district.vo';
import { PostalCode } from '../value-objects/address/postal-code.vo';
import { Province } from '../value-objects/address/province.vo';
import { Ward } from '../value-objects/address/ward.vo';
import { PersonName } from '../value-objects/user/person-name.vo';
import { PhoneNumber } from '../value-objects/user/phone-number.vo';
import { AddressId } from '../value-objects/address/address-id.vo';

export interface AddressProps {
  receiverName: PersonName;
  phoneNumber: PhoneNumber;
  province: Province;
  district: District;
  ward: Ward;
  addressLine: AddressLine;
  postalCode?: PostalCode;
  label: EAddressLabel;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Address extends AggregateRoot<AddressId> {
  private constructor(
    id: AddressId,
    private props: AddressProps,
  ) {
    super(id);
  }

  public static create(
    id: AddressId,
    props: Omit<AddressProps, 'createdAt' | 'updatedAt'>,
  ): Address {
    const now = new Date();

    return new Address(id, {
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static restore(id: AddressId, props: AddressProps): Address {
    return new Address(id, props);
  }

  get receiverName(): PersonName {
    return this.props.receiverName;
  }

  get phoneNumber(): PhoneNumber {
    return this.props.phoneNumber;
  }

  get province(): Province {
    return this.props.province;
  }

  get district(): District {
    return this.props.district;
  }

  get ward(): Ward {
    return this.props.ward;
  }

  get addressLine(): AddressLine {
    return this.props.addressLine;
  }

  get postalCode(): PostalCode | undefined {
    return this.props.postalCode;
  }

  get label(): EAddressLabel {
    return this.props.label;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public makeDefault(): void {
    this.props.isDefault = true;
    this.touch();
  }

  public unsetDefault(): void {
    this.props.isDefault = false;
    this.touch();
  }

  public update(props: {
    receiverName: PersonName;
    phoneNumber: PhoneNumber;
    province: Province;
    district: District;
    ward: Ward;
    addressLine: AddressLine;
    postalCode?: PostalCode;
    label: EAddressLabel;
  }): void {
    this.props.receiverName = props.receiverName;
    this.props.phoneNumber = props.phoneNumber;
    this.props.province = props.province;
    this.props.district = props.district;
    this.props.ward = props.ward;
    this.props.addressLine = props.addressLine;
    this.props.postalCode = props.postalCode;
    this.props.label = props.label;

    this.touch();
  }

  public isHome(): boolean {
    return this.props.label === EAddressLabel.HOME;
  }

  public isOffice(): boolean {
    return this.props.label === EAddressLabel.OFFICE;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
