export class HandleStockReservationCompletedCommand {
  constructor(
    public readonly orderId: string,
    public readonly items: Array<{
      productId: string;
      variantId: string;
      quantity: number;
    }>,
  ) {}
}
