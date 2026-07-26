import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { AddVariantCommand } from 'apps/products-service/src/application/commands/add-variant/add-variant.command';
import { AdjustStockCommand } from 'apps/products-service/src/application/commands/adjust-stock/adjust-stock.command';
import { ArchiveProductCommand } from 'apps/products-service/src/application/commands/archive-product/archive-product.command';
import { CreateProductCommand } from 'apps/products-service/src/application/commands/create-product/create-product.command';
import { PublishProductCommand } from 'apps/products-service/src/application/commands/publish-product/publish-product.command';
import { ReleaseStockCommand } from 'apps/products-service/src/application/commands/release-stock/release-stock.command';
import {
  ReserveStockCommand,
  StockMutationResult,
} from 'apps/products-service/src/application/commands/reserve-stock/reserve-stock.command';
import { RemoveVariantCommand } from 'apps/products-service/src/application/commands/remove-variant/remove-variant.command';
import { SetProductImagesCommand } from 'apps/products-service/src/application/commands/set-product-images/set-product-images.command';
import { UpdateProductCommand } from 'apps/products-service/src/application/commands/update-product/update-product.command';
import { UpdateVariantCommand } from 'apps/products-service/src/application/commands/update-variant/update-variant.command';
import {
  ProductDetailDto,
  ProductListItemDto,
} from 'apps/products-service/src/application/dto/product.dto';
import { GetProductBySlugQuery } from 'apps/products-service/src/application/queries/get-product-by-slug/get-product-by-slug.query';
import { GetProductQuery } from 'apps/products-service/src/application/queries/get-product/get-product.query';
import { ListProductsQuery } from 'apps/products-service/src/application/queries/list-products/list-products.query';
import { AddVariantDto } from './dto/add-variant.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ReleaseStockDto, ReserveStockDto } from './dto/reserve-stock.dto';
import { SetImagesDto } from './dto/set-images.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@ApiTags('products')
@Controller('products')
export class ProductsHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Body() body: CreateProductDto): Promise<ProductDetailDto> {
    return this.commandBus.execute(
      new CreateProductCommand(
        body.name,
        body.slug,
        body.categoryId,
        body.description,
        body.brandId,
        (body.variants ?? []).map((variant) => ({
          sku: variant.sku,
          options: variant.options,
          priceAmount: variant.price.amountMinor,
          priceCurrency: variant.price.currency,
          onHand: variant.onHand,
          barcode: variant.barcode,
          isActive: variant.isActive,
        })),
        (body.images ?? []).map((image) => ({
          url: image.url,
          alt: image.alt,
          sortOrder: image.sortOrder,
          isPrimary: image.isPrimary,
        })),
      ),
    );
  }

  @Get()
  list(
    @Query() query: ListProductsQueryDto,
  ): Promise<PagedResultDto<ProductListItemDto>> {
    return this.queryBus.execute(
      new ListProductsQuery(
        query.page ?? 1,
        query.limit ?? 20,
        query.status,
        query.categoryId,
        query.brandId,
        query.query,
      ),
    );
  }

  @Get('slug/:slug')
  getBySlug(@Param('slug') slug: string): Promise<ProductDetailDto> {
    return this.queryBus.execute(new GetProductBySlugQuery(slug));
  }

  @Post('stock/reserve')
  reserveStock(@Body() body: ReserveStockDto): Promise<StockMutationResult> {
    return this.commandBus.execute(
      new ReserveStockCommand(body.orderId, body.items),
    );
  }

  @Post('stock/release')
  releaseStock(@Body() body: ReleaseStockDto): Promise<StockMutationResult> {
    return this.commandBus.execute(
      new ReleaseStockCommand(body.orderId, body.items),
    );
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<ProductDetailDto> {
    return this.queryBus.execute(new GetProductQuery(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ): Promise<ProductDetailDto> {
    return this.commandBus.execute(
      new UpdateProductCommand(
        id,
        body.name,
        body.slug,
        body.description,
        body.categoryId,
        body.brandId,
        body.clearDescription,
        body.clearBrand,
      ),
    );
  }

  @Post(':id/publish')
  publish(@Param('id') id: string): Promise<ProductDetailDto> {
    return this.commandBus.execute(new PublishProductCommand(id));
  }

  @Post(':id/archive')
  archive(@Param('id') id: string): Promise<ProductDetailDto> {
    return this.commandBus.execute(new ArchiveProductCommand(id));
  }

  @Post(':id/variants')
  addVariant(
    @Param('id') id: string,
    @Body() body: AddVariantDto,
  ): Promise<ProductDetailDto> {
    return this.commandBus.execute(
      new AddVariantCommand(
        id,
        body.sku,
        body.options,
        body.price.amountMinor,
        body.price.currency,
        body.onHand,
        body.barcode,
        body.isActive,
      ),
    );
  }

  @Patch(':id/variants/:variantId')
  updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() body: UpdateVariantDto,
  ): Promise<ProductDetailDto> {
    return this.commandBus.execute(
      new UpdateVariantCommand(
        id,
        variantId,
        body.options,
        body.price?.amountMinor,
        body.price?.currency,
        body.barcode,
        body.isActive,
        body.clearBarcode,
      ),
    );
  }

  @Delete(':id/variants/:variantId')
  removeVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ): Promise<ProductDetailDto> {
    return this.commandBus.execute(new RemoveVariantCommand(id, variantId));
  }

  @Put(':id/images')
  setImages(
    @Param('id') id: string,
    @Body() body: SetImagesDto,
  ): Promise<ProductDetailDto> {
    return this.commandBus.execute(
      new SetProductImagesCommand(
        id,
        body.images.map((image) => ({
          url: image.url,
          alt: image.alt,
          sortOrder: image.sortOrder,
          isPrimary: image.isPrimary,
        })),
      ),
    );
  }

  @Post(':id/variants/:variantId/stock')
  adjustStock(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() body: AdjustStockDto,
  ): Promise<ProductDetailDto> {
    return this.commandBus.execute(
      new AdjustStockCommand(id, variantId, body.delta),
    );
  }
}
