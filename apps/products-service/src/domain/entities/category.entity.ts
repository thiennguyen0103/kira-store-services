import { AggregateRoot } from 'libs/shared/domain/aggregate-root';
import { CategoryCreatedEvent } from '../events/category-created.event';
import { InvalidCategoryException } from '../exceptions/invalid-category.exception';
import { CategoryId } from '../value-objects/category/category-id.vo';
import { CategoryName } from '../value-objects/category/category-name.vo';
import { CategoryPath } from '../value-objects/category/category-path.vo';
import { Slug } from '../value-objects/shared/slug.vo';

export interface CategoryProps {
  name: CategoryName;
  slug: Slug;
  path: CategoryPath;
  parentId?: CategoryId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Category extends AggregateRoot<CategoryId> {
  private constructor(
    id: CategoryId,
    private props: CategoryProps,
  ) {
    super(id);
  }

  public static createRoot(
    id: CategoryId,
    name: CategoryName,
    slug: Slug,
  ): Category {
    const now = new Date();

    const category = new Category(id, {
      name,
      slug,
      path: CategoryPath.forRoot(slug.value),
      parentId: undefined,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    category.addDomainEvent(new CategoryCreatedEvent(category.id));

    return category;
  }

  public static createChild(
    id: CategoryId,
    name: CategoryName,
    slug: Slug,
    parent: Category,
  ): Category {
    if (!parent.isActive) {
      throw new InvalidCategoryException(
        'Cannot create a child under an inactive category.',
        { parentId: parent.id.value },
      );
    }

    if (parent.id.equals(id)) {
      throw new InvalidCategoryException('Category cannot be its own parent.');
    }

    const now = new Date();

    const category = new Category(id, {
      name,
      slug,
      path: CategoryPath.childOf(parent.path, slug.value),
      parentId: parent.id,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    category.addDomainEvent(new CategoryCreatedEvent(category.id));

    return category;
  }

  public static restore(id: CategoryId, props: CategoryProps): Category {
    return new Category(id, props);
  }

  get name(): CategoryName {
    return this.props.name;
  }

  get slug(): Slug {
    return this.props.slug;
  }

  get path(): CategoryPath {
    return this.props.path;
  }

  get parentId(): CategoryId | undefined {
    return this.props.parentId;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get depth(): number {
    return this.props.path.depth;
  }

  public rename(name: CategoryName): void {
    this.props.name = name;
    this.touch();
  }

  public activate(): void {
    this.props.isActive = true;
    this.touch();
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
