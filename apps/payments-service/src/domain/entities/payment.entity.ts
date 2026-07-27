import { AggregateRoot } from 'libs/shared/domain/aggregate-root';
import { PaymentProvider, PaymentStatus } from 'libs/shared/enums';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { InvalidPaymentStateException } from '../exceptions/invalid-payment-state.exception';
import { PaymentFailedDomainEvent } from '../events/payment-failed.event';
import { PaymentInitiatedDomainEvent } from '../events/payment-initiated.event';
import { PaymentRefundedDomainEvent } from '../events/payment-refunded.event';
import { PaymentSucceededDomainEvent } from '../events/payment-succeeded.event';
import { Money } from '../value-objects/money.vo';
import { PaymentId } from '../value-objects/payment-id.vo';

export interface PaymentProps {
  orderId: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  amount: Money;
  providerPaymentId?: string;
  checkoutUrl?: string;
  customerId?: string;
  description?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Payment extends AggregateRoot<PaymentId> {
  private constructor(
    id: PaymentId,
    private props: PaymentProps,
  ) {
    super(id);
  }

  public static create(
    id: PaymentId,
    orderId: string,
    amount: Money,
    provider: PaymentProvider,
    options?: {
      customerId?: string;
      description?: string;
    },
  ): Payment {
    if (!orderId.trim()) {
      throw new DomainException('Order id is required.', {
        code: 'INVALID_ORDER_ID',
      });
    }

    const now = new Date();
    const payment = new Payment(id, {
      orderId,
      status: PaymentStatus.INITIATED,
      provider,
      amount,
      customerId: options?.customerId,
      description: options?.description,
      createdAt: now,
      updatedAt: now,
    });

    payment.addDomainEvent(new PaymentInitiatedDomainEvent(payment.id));
    return payment;
  }

  public static restore(id: PaymentId, props: PaymentProps): Payment {
    return new Payment(id, props);
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get provider(): PaymentProvider {
    return this.props.provider;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get providerPaymentId(): string | undefined {
    return this.props.providerPaymentId;
  }

  get checkoutUrl(): string | undefined {
    return this.props.checkoutUrl;
  }

  get customerId(): string | undefined {
    return this.props.customerId;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get failureReason(): string | undefined {
    return this.props.failureReason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public attachCheckout(providerPaymentId: string, checkoutUrl: string): void {
    if (this.props.status !== PaymentStatus.INITIATED) {
      throw new InvalidPaymentStateException(
        'attachCheckout',
        this.props.status,
      );
    }

    this.props.providerPaymentId = providerPaymentId;
    this.props.checkoutUrl = checkoutUrl;
    this.touch();
  }

  public markSucceeded(providerPaymentId?: string): void {
    if (this.props.status === PaymentStatus.SUCCEEDED) {
      return;
    }

    if (
      this.props.status !== PaymentStatus.INITIATED &&
      this.props.status !== PaymentStatus.FAILED
    ) {
      throw new InvalidPaymentStateException(
        'markSucceeded',
        this.props.status,
      );
    }

    if (providerPaymentId) {
      this.props.providerPaymentId = providerPaymentId;
    }

    this.props.status = PaymentStatus.SUCCEEDED;
    this.props.failureReason = undefined;
    this.touch();
    this.addDomainEvent(new PaymentSucceededDomainEvent(this.id));
  }

  public markFailed(reason?: string): void {
    if (this.props.status === PaymentStatus.SUCCEEDED) {
      throw new InvalidPaymentStateException('markFailed', this.props.status);
    }

    if (this.props.status === PaymentStatus.FAILED) {
      return;
    }

    if (this.props.status === PaymentStatus.REFUNDED) {
      throw new InvalidPaymentStateException('markFailed', this.props.status);
    }

    this.props.status = PaymentStatus.FAILED;
    this.props.failureReason = reason;
    this.touch();
    this.addDomainEvent(new PaymentFailedDomainEvent(this.id, reason));
  }

  public refund(): void {
    if (this.props.status === PaymentStatus.REFUNDED) {
      return;
    }

    if (this.props.status !== PaymentStatus.SUCCEEDED) {
      throw new InvalidPaymentStateException('refund', this.props.status);
    }

    this.props.status = PaymentStatus.REFUNDED;
    this.touch();
    this.addDomainEvent(new PaymentRefundedDomainEvent(this.id));
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
