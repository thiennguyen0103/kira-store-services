import { UniqueId } from './unique-id.vo';

export abstract class Entity<TId extends UniqueId> {
  protected constructor(protected readonly _id: TId) {}

  public get id(): TId {
    return this._id;
  }

  public equals(object?: Entity<TId>): boolean {
    if (!object) {
      return false;
    }

    if (this === object) {
      return true;
    }

    return this._id.equals(object.id);
  }
}
