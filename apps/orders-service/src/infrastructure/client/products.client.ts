import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ProductsClientPort,
  ProductVariantSnapshot,
  ReserveStockItem,
  ReserveStockResult,
} from 'apps/orders-service/src/application/ports/products-client.port';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import type {
  GetProductRequest,
  ProductResponse,
  ProductsServiceClient,
  ReserveStockRequest,
} from 'libs/shared/generated/products';

@Injectable()
export class ProductsClient extends ProductsClientPort implements OnModuleInit {
  private productsService!: ProductsServiceClient;

  constructor(
    @Inject(SERVICE_TOKENS.PRODUCTS_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.productsService = this.client.getService<ProductsServiceClient>(
      GRPC_SERVICE_NAMES.PRODUCTS,
    );
  }

  async getProductVariant(
    productId: string,
    variantId: string,
  ): Promise<ProductVariantSnapshot> {
    const request: GetProductRequest = { productId };
    let product: ProductResponse;
    try {
      product = await firstValueFrom(this.productsService.getProduct(request));
    } catch (error) {
      throw new DomainException('Failed to fetch product.', {
        code: 'PRODUCT_LOOKUP_FAILED',
        details: { productId },
        cause: error instanceof Error ? error : undefined,
      });
    }

    const variant = (product.variants ?? []).find((v) => v.id === variantId);
    if (!variant) {
      throw new DomainException('Product variant not found.', {
        code: 'VARIANT_NOT_FOUND',
        details: { productId, variantId },
      });
    }

    if (!variant.price) {
      throw new DomainException('Product variant has no price.', {
        code: 'VARIANT_PRICE_MISSING',
        details: { productId, variantId },
      });
    }

    return {
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      sku: variant.sku,
      unitPriceAmount: Number(variant.price.amountMinor),
      currency: variant.price.currency,
      available: variant.available,
      isActive: variant.isActive,
      productStatus: product.status,
    };
  }

  async reserveStock(
    orderId: string,
    items: ReserveStockItem[],
  ): Promise<ReserveStockResult> {
    const request: ReserveStockRequest = {
      orderId,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await firstValueFrom(
        this.productsService.reserveStock(request),
      );
      return {
        success: response.success,
        message: response.message ?? '',
      };
    } catch (error) {
      throw new DomainException('Failed to reserve stock.', {
        code: 'STOCK_RESERVATION_FAILED',
        details: { orderId },
        cause: error instanceof Error ? error : undefined,
      });
    }
  }
}
