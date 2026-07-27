export interface ProductVariantSnapshot {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  unitPriceAmount: number;
  currency: string;
  available: number;
  isActive: boolean;
  productStatus: string;
}

export interface ReserveStockItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface ReserveStockResult {
  success: boolean;
  message: string;
}

export abstract class ProductsClientPort {
  abstract getProductVariant(
    productId: string,
    variantId: string,
  ): Promise<ProductVariantSnapshot>;

  abstract reserveStock(
    orderId: string,
    items: ReserveStockItem[],
  ): Promise<ReserveStockResult>;
}
