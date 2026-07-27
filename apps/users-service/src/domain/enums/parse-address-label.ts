import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { EAddressLabel } from '../enums/address-label.enum';

export function parseAddressLabel(raw: string): EAddressLabel {
  const label = raw.trim().toUpperCase();
  if (!Object.values(EAddressLabel).includes(label as EAddressLabel)) {
    throw new DomainException(
      `Invalid address label '${raw}'. Expected HOME, OFFICE, or OTHER.`,
      { code: 'INVALID_ADDRESS_LABEL' },
    );
  }
  return label as EAddressLabel;
}
