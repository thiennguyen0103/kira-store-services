import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BrandDto } from 'apps/products-service/src/application/dto/brand.dto';
import { Brand } from 'apps/products-service/src/domain/entities/brand.entity';
import { DuplicateSlugException } from 'apps/products-service/src/domain/exceptions/duplicate-slug.exception';
import { BrandRepository } from 'apps/products-service/src/domain/repositories/brand.repository';
import { BrandId } from 'apps/products-service/src/domain/value-objects/brand/brand-id.vo';
import { BrandName } from 'apps/products-service/src/domain/value-objects/brand/brand-name.vo';
import { ImageUrl } from 'apps/products-service/src/domain/value-objects/shared/image-url.vo';
import { Slug } from 'apps/products-service/src/domain/value-objects/shared/slug.vo';
import { CreateBrandCommand } from './create-brand.command';

@CommandHandler(CreateBrandCommand)
export class CreateBrandHandler implements ICommandHandler<CreateBrandCommand> {
  constructor(private readonly brands: BrandRepository) {}

  async execute(command: CreateBrandCommand): Promise<BrandDto> {
    const slug = Slug.create(command.slug);

    if (await this.brands.existsBySlug(slug)) {
      throw new DuplicateSlugException(slug.value);
    }

    const brand = Brand.create(
      BrandId.create(),
      BrandName.create(command.name),
      slug,
      command.logoUrl ? ImageUrl.create(command.logoUrl) : undefined,
    );

    await this.brands.save(brand);

    return new BrandDto(
      brand.id.value,
      brand.name.value,
      brand.slug.value,
      brand.logoUrl?.value ?? null,
      brand.isActive,
      brand.createdAt,
      brand.updatedAt,
    );
  }
}
