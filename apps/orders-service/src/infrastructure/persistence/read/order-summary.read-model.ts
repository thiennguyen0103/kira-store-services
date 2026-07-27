export interface OrderSummaryReadModel {
  id: string;
  customerId: string;
  status: string;
  totalAmount: number;
  totalCurrency: string;
  paymentProvider: string;
  createdAt: string;
  updatedAt: string;
}
