import type { StockItemInput } from '../reserve-stock/reserve-stock.command';

export class ReleaseStockCommand {
  constructor(
    public readonly orderId: string | undefined,
    public readonly items: StockItemInput[],
  ) {}
}
