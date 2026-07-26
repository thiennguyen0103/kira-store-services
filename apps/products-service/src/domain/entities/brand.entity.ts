import { AggregateRoot } from 'libs/shared/domain/aggregate-root';
import { BrandCreatedEvent } from '../events/brand-created.event';
import { BrandId } from '../value-objects/brand/brand-id.vo';
import { BrandName } from '../value-objects/brand/brand-name.vo';
import { ImageUrl } from '../value-objects/shared/image-url.vo';
import { Slug } from '../value-objects/shared/slug.vo';

export interface BrandProps {
  name: BrandName;
  slug: Slug;
  logoUrl?: ImageUrl;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Brand extends AggregateRoot<BrandId> {
  private constructor(
    id: BrandId,
    private props: BrandProps,
  ) {
    super(id);
  }

  public static create(
    id: BrandId,
    name: BrandName,
    slug: Slug,
    logoUrl?: ImageUrl,
  ): Brand {
    const now = new Date();

    const brand = new Brand(id, {
      name,
      slug,
      logoUrl,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    brand.addDomainEvent(new BrandCreatedEvent(brand.id));

    return brand;
  }

  public static restore(id: BrandId, props: BrandProps): Brand {
    return new Brand(id, props);
  }

  get name(): BrandName {
    return this.props.name;
  }

  get slug(): Slug {
    return this.props.slug;
  }

  get logoUrl(): ImageUrl | undefined {
    return this.props.logoUrl;
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

  public rename(name: BrandName): void {
    this.props.name = name;
    this.touch();
  }

  public setLogo(logoUrl?: ImageUrl): void {
    this.props.logoUrl = logoUrl;
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
