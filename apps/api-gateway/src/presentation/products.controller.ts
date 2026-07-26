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
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import type {
  ListProductsResponse,
  ProductResponse,
  StockMutationResponse,
} from 'libs/shared/generated/products';
import { ProductsClientPort } from '../application/ports/products-client.port';
import { AddVariantDto } from './dto/products/add-variant.dto';
import { AdjustStockDto } from './dto/products/adjust-stock.dto';
import { CreateProductDto } from './dto/products/create-product.dto';
import { ListProductsQueryDto } from './dto/products/list-products-query.dto';
import {
  ReleaseStockDto,
  ReserveStockDto,
} from './dto/products/reserve-stock.dto';
import { SetImagesDto } from './dto/products/set-images.dto';
import { UpdateProductDto } from './dto/products/update-product.dto';
import { UpdateVariantDto } from './dto/products/update-variant.dto';
import { callGrpc } from './helpers/call-grpc.helper';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsClient: ProductsClientPort) {}

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiBody({ type: CreateProductDto })
  @ApiOkResponse({ description: 'Created product detail' })
  create(@Body() body: CreateProductDto): Promise<ProductResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.createProduct({
          name: body.name,
          slug: body.slug,
          categoryId: body.categoryId,
          description: body.description ?? '',
          brandId: body.brandId ?? '',
          variants: (body.variants ?? []).map((variant) => ({
            sku: variant.sku,
            options: variant.options,
            price: {
              amountMinor: variant.price.amountMinor,
              currency: variant.price.currency,
            },
            onHand: variant.onHand ?? 0,
            barcode: variant.barcode ?? '',
            isActive: variant.isActive ?? true,
          })),
          images: (body.images ?? []).map((image) => ({
            url: image.url,
            alt: image.alt ?? '',
            sortOrder: image.sortOrder ?? 0,
            isPrimary: image.isPrimary ?? false,
          })),
        }),
      ),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiOkResponse({ description: 'Paged list of products' })
  list(@Query() query: ListProductsQueryDto): Promise<ListProductsResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.listProducts({
          page: query.page ?? 1,
          limit: query.limit ?? 20,
          status: query.status ?? '',
          categoryId: query.categoryId ?? '',
          brandId: query.brandId ?? '',
          query: query.query ?? '',
        }),
      ),
    );
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiParam({ name: 'slug', example: 'classic-t-shirt' })
  @ApiOkResponse({ description: 'Product detail' })
  getBySlug(@Param('slug') slug: string): Promise<ProductResponse> {
    return callGrpc(() =>
      firstValueFrom(this.productsClient.getProductBySlug({ slug })),
    );
  }

  @Post('stock/reserve')
  @ApiOperation({ summary: 'Reserve stock for an order' })
  @ApiBody({ type: ReserveStockDto })
  @ApiOkResponse({ description: 'Stock reservation result' })
  reserveStock(@Body() body: ReserveStockDto): Promise<StockMutationResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.reserveStock({
          orderId: body.orderId ?? '',
          items: body.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      ),
    );
  }

  @Post('stock/release')
  @ApiOperation({ summary: 'Release reserved stock for an order' })
  @ApiBody({ type: ReleaseStockDto })
  @ApiOkResponse({ description: 'Stock release result' })
  releaseStock(@Body() body: ReleaseStockDto): Promise<StockMutationResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.releaseStock({
          orderId: body.orderId ?? '',
          items: body.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ description: 'Product detail' })
  getById(@Param('id') id: string): Promise<ProductResponse> {
    return callGrpc(() =>
      firstValueFrom(this.productsClient.getProduct({ productId: id })),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({ description: 'Updated product detail' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ): Promise<ProductResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.updateProduct({
          productId: id,
          name: body.name ?? '',
          slug: body.slug ?? '',
          description: body.description ?? '',
          categoryId: body.categoryId ?? '',
          brandId: body.brandId ?? '',
          clearDescription: body.clearDescription ?? false,
          clearBrand: body.clearBrand ?? false,
        }),
      ),
    );
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a product' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ description: 'Published product detail' })
  publish(@Param('id') id: string): Promise<ProductResponse> {
    return callGrpc(() =>
      firstValueFrom(this.productsClient.publishProduct({ productId: id })),
    );
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a product' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ description: 'Archived product detail' })
  archive(@Param('id') id: string): Promise<ProductResponse> {
    return callGrpc(() =>
      firstValueFrom(this.productsClient.archiveProduct({ productId: id })),
    );
  }

  @Post(':id/variants')
  @ApiOperation({ summary: 'Add a variant to a product' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: AddVariantDto })
  @ApiOkResponse({ description: 'Updated product detail' })
  addVariant(
    @Param('id') id: string,
    @Body() body: AddVariantDto,
  ): Promise<ProductResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.addVariant({
          productId: id,
          variant: {
            sku: body.sku,
            options: body.options,
            price: {
              amountMinor: body.price.amountMinor,
              currency: body.price.currency,
            },
            onHand: body.onHand ?? 0,
            barcode: body.barcode ?? '',
            isActive: body.isActive ?? true,
          },
        }),
      ),
    );
  }

  @Patch(':id/variants/:variantId')
  @ApiOperation({ summary: 'Update a product variant' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'variantId',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @ApiBody({ type: UpdateVariantDto })
  @ApiOkResponse({ description: 'Updated product detail' })
  updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() body: UpdateVariantDto,
  ): Promise<ProductResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.updateVariant({
          productId: id,
          variantId,
          options: body.options ?? {},
          price: body.price
            ? {
                amountMinor: body.price.amountMinor,
                currency: body.price.currency,
              }
            : undefined,
          barcode: body.barcode ?? '',
          isActive: body.isActive ?? false,
          clearBarcode: body.clearBarcode ?? false,
          hasOptions: body.options !== undefined,
          hasPrice: body.price !== undefined,
          hasIsActive: body.isActive !== undefined,
        }),
      ),
    );
  }

  @Delete(':id/variants/:variantId')
  @ApiOperation({ summary: 'Remove a product variant' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'variantId',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @ApiOkResponse({ description: 'Updated product detail' })
  removeVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ): Promise<ProductResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.removeVariant({ productId: id, variantId }),
      ),
    );
  }

  @Put(':id/images')
  @ApiOperation({ summary: 'Replace product images' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: SetImagesDto })
  @ApiOkResponse({ description: 'Updated product detail' })
  setImages(
    @Param('id') id: string,
    @Body() body: SetImagesDto,
  ): Promise<ProductResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.setProductImages({
          productId: id,
          images: body.images.map((image) => ({
            url: image.url,
            alt: image.alt ?? '',
            sortOrder: image.sortOrder ?? 0,
            isPrimary: image.isPrimary ?? false,
          })),
        }),
      ),
    );
  }

  @Post(':id/variants/:variantId/stock')
  @ApiOperation({ summary: 'Adjust variant stock' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiParam({
    name: 'variantId',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @ApiBody({ type: AdjustStockDto })
  @ApiOkResponse({ description: 'Updated product detail' })
  adjustStock(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() body: AdjustStockDto,
  ): Promise<ProductResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.adjustStock({
          productId: id,
          variantId,
          delta: body.delta,
        }),
      ),
    );
  }
}
