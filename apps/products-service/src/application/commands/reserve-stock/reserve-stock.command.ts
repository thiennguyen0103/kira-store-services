export interface StockItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

export class ReserveStockCommand {
  constructor(
    public readonly orderId: string | undefined,
    public readonly items: StockItemInput[],
  ) {}
}

export class StockMutationResult {
  constructor(
    public readonly orderId: string | undefined,
    public readonly success: boolean,
    public readonly message: string,
  ) {}
}
