import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import type {
  ListProductsResponse,
  ProductResponse,
} from 'libs/shared/generated/products';
import { ProductsClientPort } from '../application/ports/products-client.port';
import { Public } from './decorators/public.decorator';
import { PublicListProductsQueryDto } from './dto/products/public-list-products-query.dto';
import { callGrpc } from './helpers/call-grpc.helper';

@ApiTags('products')
@Public()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsClient: ProductsClientPort) {}

  @Get()
  @ApiOperation({ summary: 'List active products' })
  @ApiOkResponse({ description: 'Paged list of active products' })
  list(
    @Query() query: PublicListProductsQueryDto,
  ): Promise<ListProductsResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.listProducts({
          page: query.page ?? 1,
          limit: query.limit ?? 20,
          status: 'ACTIVE',
          categoryId: query.categoryId ?? '',
          brandId: query.brandId ?? '',
          query: query.query ?? '',
        }),
      ),
    );
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get active product by slug' })
  @ApiParam({ name: 'slug', example: 'classic-t-shirt' })
  @ApiOkResponse({ description: 'Product detail' })
  async getBySlug(@Param('slug') slug: string): Promise<ProductResponse> {
    const product = await callGrpc(() =>
      firstValueFrom(this.productsClient.getProductBySlug({ slug })),
    );
    if (product.status !== 'ACTIVE') {
      throw new NotFoundException(`Product not found: ${slug}`);
    }
    return product;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get active product by id' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ description: 'Product detail' })
  async getById(@Param('id') id: string): Promise<ProductResponse> {
    const product = await callGrpc(() =>
      firstValueFrom(this.productsClient.getProduct({ productId: id })),
    );
    if (product.status !== 'ACTIVE') {
      throw new NotFoundException(`Product not found: ${id}`);
    }
    return product;
  }
}
