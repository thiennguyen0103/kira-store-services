import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BrandDto } from 'apps/products-service/src/application/dto/brand.dto';
import { BrandNotFoundException } from 'apps/products-service/src/domain/exceptions/brand-not-found.exception';
import { BrandRepository } from 'apps/products-service/src/domain/repositories/brand.repository';
import { BrandId } from 'apps/products-service/src/domain/value-objects/brand/brand-id.vo';
import { SetBrandActiveCommand } from './set-brand-active.command';

@CommandHandler(SetBrandActiveCommand)
export class SetBrandActiveHandler implements ICommandHandler<SetBrandActiveCommand> {
  constructor(private readonly brands: BrandRepository) {}

  async execute(command: SetBrandActiveCommand): Promise<BrandDto> {
    const brand = await this.brands.findById(BrandId.restore(command.brandId));

    if (!brand) {
      throw new BrandNotFoundException(command.brandId);
    }

    if (command.isActive) {
      brand.activate();
    } else {
      brand.deactivate();
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
