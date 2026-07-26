import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { StockMutationResult } from 'apps/products-service/src/application/commands/reserve-stock/reserve-stock.command';
import { AddVariantCommand } from 'apps/products-service/src/application/commands/add-variant/add-variant.command';
import { AdjustStockCommand } from 'apps/products-service/src/application/commands/adjust-stock/adjust-stock.command';
import { ArchiveProductCommand } from 'apps/products-service/src/application/commands/archive-product/archive-product.command';
import { CreateBrandCommand } from 'apps/products-service/src/application/commands/create-brand/create-brand.command';
import { CreateCategoryCommand } from 'apps/products-service/src/application/commands/create-category/create-category.command';
import { CreateProductCommand } from 'apps/products-service/src/application/commands/create-product/create-product.command';
import { PublishProductCommand } from 'apps/products-service/src/application/commands/publish-product/publish-product.command';
import { ReleaseStockCommand } from 'apps/products-service/src/application/commands/release-stock/release-stock.command';
import { ReserveStockCommand } from 'apps/products-service/src/application/commands/reserve-stock/reserve-stock.command';
import { RemoveVariantCommand } from 'apps/products-service/src/application/commands/remove-variant/remove-variant.command';
import { SetBrandActiveCommand } from 'apps/products-service/src/application/commands/set-brand-active/set-brand-active.command';
import { SetCategoryActiveCommand } from 'apps/products-service/src/application/commands/set-category-active/set-category-active.command';
import { SetProductImagesCommand } from 'apps/products-service/src/application/commands/set-product-images/set-product-images.command';
import { UpdateBrandCommand } from 'apps/products-service/src/application/commands/update-brand/update-brand.command';
import { UpdateCategoryCommand } from 'apps/products-service/src/application/commands/update-category/update-category.command';
import { UpdateProductCommand } from 'apps/products-service/src/application/commands/update-product/update-product.command';
import { UpdateVariantCommand } from 'apps/products-service/src/application/commands/update-variant/update-variant.command';
import { BrandDto } from 'apps/products-service/src/application/dto/brand.dto';
import { CategoryDto } from 'apps/products-service/src/application/dto/category.dto';
import {
  ProductDetailDto,
  ProductListItemDto,
} from 'apps/products-service/src/application/dto/product.dto';
import { GetBrandQuery } from 'apps/products-service/src/application/queries/get-brand/get-brand.query';
import { GetCategoryChildrenQuery } from 'apps/products-service/src/application/queries/get-category-children/get-category-children.query';
import { GetCategoryQuery } from 'apps/products-service/src/application/queries/get-category/get-category.query';
import { GetProductBySlugQuery } from 'apps/products-service/src/application/queries/get-product-by-slug/get-product-by-slug.query';
import { GetProductQuery } from 'apps/products-service/src/application/queries/get-product/get-product.query';
import { ListBrandsQuery } from 'apps/products-service/src/application/queries/list-brands/list-brands.query';
import { ListCategoriesQuery } from 'apps/products-service/src/application/queries/list-categories/list-categories.query';
import { ListProductsQuery } from 'apps/products-service/src/application/queries/list-products/list-products.query';
import { GRPC_SERVICE_NAMES } from 'libs/shared/constants';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import type {
  AddVariantRequest,
  AdjustStockRequest,
  ArchiveProductRequest,
  BrandResponse,
  CategoryResponse,
  CreateBrandRequest,
  CreateCategoryRequest,
  CreateProductRequest,
  GetBrandRequest,
  GetCategoryChildrenRequest,
  GetCategoryRequest,
  GetProductBySlugRequest,
  GetProductRequest,
  ListBrandsRequest,
  ListBrandsResponse,
  ListCategoriesRequest,
  ListCategoriesResponse,
  ListProductsRequest,
  ListProductsResponse,
  PingRequest,
  PingResponse,
  ProductResponse,
  PublishProductRequest,
  ReleaseStockRequest,
  RemoveVariantRequest,
  ReserveStockRequest,
  SetBrandActiveRequest,
  SetCategoryActiveRequest,
  SetProductImagesRequest,
  StockMutationResponse,
  UpdateBrandRequest,
  UpdateCategoryRequest,
  UpdateProductRequest,
  UpdateVariantRequest,
} from 'libs/shared/generated/products';
import { ProductResponseMapper } from './mappers/product-response.mapper';

function optionalString(value: string | undefined): string | undefined {
  return value === '' || value === undefined ? undefined : value;
}

@Controller()
export class ProductsGrpcController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'Ping')
  ping(_data: PingRequest): PingResponse {
    return { ok: true, service: 'products-service' };
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'CreateProduct')
  async createProduct(request: CreateProductRequest): Promise<ProductResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        CreateProductCommand,
        ProductDetailDto
      >(
        new CreateProductCommand(
          request.name,
          request.slug,
          request.categoryId,
          optionalString(request.description),
          optionalString(request.brandId),
          (request.variants ?? []).map((variant) => ({
            sku: variant.sku,
            options: variant.options ?? {},
            priceAmount: variant.price?.amountMinor ?? 0,
            priceCurrency: variant.price?.currency ?? '',
            onHand: variant.onHand,
            barcode: optionalString(variant.barcode),
            isActive: variant.isActive,
          })),
          (request.images ?? []).map((image) => ({
            url: image.url,
            alt: optionalString(image.alt),
            sortOrder: image.sortOrder,
            isPrimary: image.isPrimary,
          })),
        ),
      );
      return ProductResponseMapper.toProductResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'UpdateProduct')
  async updateProduct(request: UpdateProductRequest): Promise<ProductResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        UpdateProductCommand,
        ProductDetailDto
      >(
        new UpdateProductCommand(
          request.productId,
          optionalString(request.name),
          optionalString(request.slug),
          optionalString(request.description),
          optionalString(request.categoryId),
          optionalString(request.brandId),
          request.clearDescription || undefined,
          request.clearBrand || undefined,
        ),
      );
      return ProductResponseMapper.toProductResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'GetProduct')
  async getProduct(request: GetProductRequest): Promise<ProductResponse> {
    return this.execute(async () => {
      const dto = await this.queryBus.execute<
        GetProductQuery,
        ProductDetailDto
      >(new GetProductQuery(request.productId));
      return ProductResponseMapper.toProductResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'GetProductBySlug')
  async getProductBySlug(
    request: GetProductBySlugRequest,
  ): Promise<ProductResponse> {
    return this.execute(async () => {
      const dto = await this.queryBus.execute<
        GetProductBySlugQuery,
        ProductDetailDto
      >(new GetProductBySlugQuery(request.slug));
      return ProductResponseMapper.toProductResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'ListProducts')
  async listProducts(
    request: ListProductsRequest,
  ): Promise<ListProductsResponse> {
    return this.execute(async () => {
      const result = await this.queryBus.execute<
        ListProductsQuery,
        PagedResultDto<ProductListItemDto>
      >(
        new ListProductsQuery(
          request.page || 1,
          request.limit || 20,
          optionalString(request.status),
          optionalString(request.categoryId),
          optionalString(request.brandId),
          optionalString(request.query),
        ),
      );
      return ProductResponseMapper.toListProductsResponse(result);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'PublishProduct')
  async publishProduct(
    request: PublishProductRequest,
  ): Promise<ProductResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        PublishProductCommand,
        ProductDetailDto
      >(new PublishProductCommand(request.productId));
      return ProductResponseMapper.toProductResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'ArchiveProduct')
  async archiveProduct(
    request: ArchiveProductRequest,
  ): Promise<ProductResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        ArchiveProductCommand,
        ProductDetailDto
      >(new ArchiveProductCommand(request.productId));
      return ProductResponseMapper.toProductResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'AddVariant')
  async addVariant(request: AddVariantRequest): Promise<ProductResponse> {
    return this.execute(async () => {
      const variant = request.variant;
      if (!variant) {
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: 'variant is required',
        });
      }

      const dto = await this.commandBus.execute<
        AddVariantCommand,
        ProductDetailDto
      >(
        new AddVariantCommand(
          request.productId,
          variant.sku,
          variant.options ?? {},
          variant.price?.amountMinor ?? 0,
          variant.price?.currency ?? '',
          variant.onHand,
          optionalString(variant.barcode),
          variant.isActive,
        ),
      );
      return ProductResponseMapper.toProductResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'UpdateVariant')
  async updateVariant(request: UpdateVariantRequest): Promise<ProductResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        UpdateVariantCommand,
        ProductDetailDto
      >(
        new UpdateVariantCommand(
          request.productId,
          request.variantId,
          request.hasOptions ? (request.options ?? {}) : undefined,
          request.hasPrice ? request.price?.amountMinor : undefined,
          request.hasPrice ? request.price?.currency : undefined,
          optionalString(request.barcode),
          request.hasIsActive ? request.isActive : undefined,
          request.clearBarcode || undefined,
        ),
      );
      return ProductResponseMapper.toProductResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'RemoveVariant')
  async removeVariant(request: RemoveVariantRequest): Promise<ProductResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        RemoveVariantCommand,
        ProductDetailDto
      >(new RemoveVariantCommand(request.productId, request.variantId));
      return ProductResponseMapper.toProductResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'SetProductImages')
  async setProductImages(
    request: SetProductImagesRequest,
  ): Promise<ProductResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        SetProductImagesCommand,
        ProductDetailDto
      >(
        new SetProductImagesCommand(
          request.productId,
          (request.images ?? []).map((image) => ({
            url: image.url,
            alt: optionalString(image.alt),
            sortOrder: image.sortOrder,
            isPrimary: image.isPrimary,
          })),
        ),
      );
      return ProductResponseMapper.toProductResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'AdjustStock')
  async adjustStock(request: AdjustStockRequest): Promise<ProductResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        AdjustStockCommand,
        ProductDetailDto
      >(
        new AdjustStockCommand(
          request.productId,
          request.variantId,
          request.delta,
        ),
      );
      return ProductResponseMapper.toProductResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'ReserveStock')
  async reserveStock(
    request: ReserveStockRequest,
  ): Promise<StockMutationResponse> {
    return this.execute(async () => {
      const result = await this.commandBus.execute<
        ReserveStockCommand,
        StockMutationResult
      >(
        new ReserveStockCommand(
          optionalString(request.orderId),
          (request.items ?? []).map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        ),
      );
      return ProductResponseMapper.toStockMutationResponse(result);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'ReleaseStock')
  async releaseStock(
    request: ReleaseStockRequest,
  ): Promise<StockMutationResponse> {
    return this.execute(async () => {
      const result = await this.commandBus.execute<
        ReleaseStockCommand,
        StockMutationResult
      >(
        new ReleaseStockCommand(
          optionalString(request.orderId),
          (request.items ?? []).map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        ),
      );
      return ProductResponseMapper.toStockMutationResponse(result);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'CreateBrand')
  async createBrand(request: CreateBrandRequest): Promise<BrandResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<CreateBrandCommand, BrandDto>(
        new CreateBrandCommand(
          request.name,
          request.slug,
          optionalString(request.logoUrl),
        ),
      );
      return ProductResponseMapper.toBrandResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'UpdateBrand')
  async updateBrand(request: UpdateBrandRequest): Promise<BrandResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<UpdateBrandCommand, BrandDto>(
        new UpdateBrandCommand(
          request.brandId,
          optionalString(request.name),
          optionalString(request.logoUrl),
          request.clearLogo || undefined,
        ),
      );
      return ProductResponseMapper.toBrandResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'GetBrand')
  async getBrand(request: GetBrandRequest): Promise<BrandResponse> {
    return this.execute(async () => {
      const dto = await this.queryBus.execute<GetBrandQuery, BrandDto>(
        new GetBrandQuery(request.brandId),
      );
      return ProductResponseMapper.toBrandResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'ListBrands')
  async listBrands(request: ListBrandsRequest): Promise<ListBrandsResponse> {
    return this.execute(async () => {
      const result = await this.queryBus.execute<
        ListBrandsQuery,
        PagedResultDto<BrandDto>
      >(
        new ListBrandsQuery(
          request.page || 1,
          request.limit || 20,
          request.activeOnly,
        ),
      );
      return ProductResponseMapper.toListBrandsResponse(result);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'SetBrandActive')
  async setBrandActive(request: SetBrandActiveRequest): Promise<BrandResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        SetBrandActiveCommand,
        BrandDto
      >(new SetBrandActiveCommand(request.brandId, request.isActive));
      return ProductResponseMapper.toBrandResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'CreateCategory')
  async createCategory(
    request: CreateCategoryRequest,
  ): Promise<CategoryResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        CreateCategoryCommand,
        CategoryDto
      >(
        new CreateCategoryCommand(
          request.name,
          request.slug,
          optionalString(request.parentId),
        ),
      );
      return ProductResponseMapper.toCategoryResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'UpdateCategory')
  async updateCategory(
    request: UpdateCategoryRequest,
  ): Promise<CategoryResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        UpdateCategoryCommand,
        CategoryDto
      >(new UpdateCategoryCommand(request.categoryId, request.name));
      return ProductResponseMapper.toCategoryResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'GetCategory')
  async getCategory(request: GetCategoryRequest): Promise<CategoryResponse> {
    return this.execute(async () => {
      const dto = await this.queryBus.execute<GetCategoryQuery, CategoryDto>(
        new GetCategoryQuery(request.categoryId),
      );
      return ProductResponseMapper.toCategoryResponse(dto);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'ListCategories')
  async listCategories(
    request: ListCategoriesRequest,
  ): Promise<ListCategoriesResponse> {
    return this.execute(async () => {
      const result = await this.queryBus.execute<
        ListCategoriesQuery,
        PagedResultDto<CategoryDto>
      >(
        new ListCategoriesQuery(
          request.page || 1,
          request.limit || 20,
          request.activeOnly,
          optionalString(request.parentId),
        ),
      );
      return ProductResponseMapper.toListCategoriesResponse(result);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'GetCategoryChildren')
  async getCategoryChildren(
    request: GetCategoryChildrenRequest,
  ): Promise<ListCategoriesResponse> {
    return this.execute(async () => {
      const items = await this.queryBus.execute<
        GetCategoryChildrenQuery,
        CategoryDto[]
      >(new GetCategoryChildrenQuery(request.parentId));
      return ProductResponseMapper.toCategoryChildrenResponse(items);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.PRODUCTS, 'SetCategoryActive')
  async setCategoryActive(
    request: SetCategoryActiveRequest,
  ): Promise<CategoryResponse> {
    return this.execute(async () => {
      const dto = await this.commandBus.execute<
        SetCategoryActiveCommand,
        CategoryDto
      >(new SetCategoryActiveCommand(request.categoryId, request.isActive));
      return ProductResponseMapper.toCategoryResponse(dto);
    });
  }

  private async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw this.toRpcException(error);
    }
  }

  private toRpcException(error: unknown): RpcException {
    if (error instanceof DomainException) {
      return new RpcException({
        code: this.mapGrpcCode(error.code),
        message: error.message,
      });
    }

    if (error instanceof Error) {
      return new RpcException({
        code: GrpcStatus.INTERNAL,
        message: error.message,
      });
    }

    return new RpcException({
      code: GrpcStatus.INTERNAL,
      message: 'Internal error',
    });
  }

  private mapGrpcCode(code: string): GrpcStatus {
    if (code.endsWith('_NOT_FOUND')) {
      return GrpcStatus.NOT_FOUND;
    }

    switch (code) {
      case 'DUPLICATE_SLUG':
      case 'DUPLICATE_SKU':
        return GrpcStatus.ALREADY_EXISTS;
      case 'INSUFFICIENT_STOCK':
      case 'PRODUCT_CANNOT_PUBLISH':
        return GrpcStatus.FAILED_PRECONDITION;
      case 'INVALID_CATEGORY':
        return GrpcStatus.INVALID_ARGUMENT;
      default:
        return GrpcStatus.INVALID_ARGUMENT;
    }
  }
}
