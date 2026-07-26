export abstract class EventPublisher {
  abstract publish<T extends object>(
    eventName: string,
    payload: T,
  ): Promise<void>;
}
