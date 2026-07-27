export abstract class OrderEventsPublisherPort {
  abstract publish<T extends object>(
    eventName: string,
    payload: T,
  ): Promise<void>;
}
