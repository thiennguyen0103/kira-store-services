export interface MoneyDto {
  amountMinor: number;
  currency: string;
}

export interface CartItemDto {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: MoneyDto;
}

export interface CartDto {
  customerId: string;
  items: CartItemDto[];
  total: MoneyDto;
  updatedAt: string;
}
