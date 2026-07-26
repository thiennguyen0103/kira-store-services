import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BrandDto } from 'apps/products-service/src/application/dto/brand.dto';
import { BrandNotFoundException } from 'apps/products-service/src/domain/exceptions/brand-not-found.exception';
import { BrandRepository } from 'apps/products-service/src/domain/repositories/brand.repository';
import { BrandId } from 'apps/products-service/src/domain/value-objects/brand/brand-id.vo';
import { BrandName } from 'apps/products-service/src/domain/value-objects/brand/brand-name.vo';
import { ImageUrl } from 'apps/products-service/src/domain/value-objects/shared/image-url.vo';
import { UpdateBrandCommand } from './update-brand.command';

@CommandHandler(UpdateBrandCommand)
export class UpdateBrandHandler implements ICommandHandler<UpdateBrandCommand> {
  constructor(private readonly brands: BrandRepository) {}

  async execute(command: UpdateBrandCommand): Promise<BrandDto> {
    const brand = await this.brands.findById(BrandId.restore(command.brandId));

    if (!brand) {
      throw new BrandNotFoundException(command.brandId);
    }

    if (command.name !== undefined) {
      brand.rename(BrandName.create(command.name));
    }

    if (command.clearLogo) {
      brand.setLogo(undefined);
    } else if (command.logoUrl !== undefined) {
      brand.setLogo(ImageUrl.create(command.logoUrl));
    }

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
