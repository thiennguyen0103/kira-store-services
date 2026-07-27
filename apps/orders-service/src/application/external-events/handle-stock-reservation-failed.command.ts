export class HandleStockReservationFailedCommand {
  constructor(
    public readonly orderId: string | undefined,
    public readonly productId: string,
    public readonly variantId: string,
    public readonly quantity: number,
    public readonly available: number,
  ) {}
}
