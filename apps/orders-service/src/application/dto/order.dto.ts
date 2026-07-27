export interface MoneyDto {
  amountMinor: number;
  currency: string;
}

export interface ShippingAddressDto {
  addressId: string;
  receiverName: string;
  phoneNumber: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  addressLine: string;
  postalCode: string;
}

export interface OrderItemDto {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: MoneyDto;
  lineTotal: MoneyDto;
}

export interface OrderDetailDto {
  id: string;
  customerId: string;
  status: string;
  items: OrderItemDto[];
  shippingAddress: ShippingAddressDto;
  total: MoneyDto;
  paymentProvider: string;
  paymentId?: string;
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  confirmedAt?: string;
}

export interface OrderSummaryDto {
  id: string;
  customerId: string;
  status: string;
  total: MoneyDto;
  paymentProvider: string;
  createdAt: string;
  updatedAt: string;
}
