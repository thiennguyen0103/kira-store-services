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
  CategoryResponse,
  ListCategoriesResponse,
} from 'libs/shared/generated/products';
import { ProductsClientPort } from '../application/ports/products-client.port';
import { Public } from './decorators/public.decorator';
import {
  CategoryResponseDto,
  ListCategoriesResponseDto,
} from './dto/products/product-response.dto';
import { PublicListQueryDto } from './dto/products/public-list-query.dto';
import { callGrpc } from './helpers/call-grpc.helper';

@ApiTags('categories')
@Public()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly productsClient: ProductsClientPort) {}

  @Get()
  @ApiOperation({ summary: 'List active categories' })
  @ApiOkResponse({
    type: ListCategoriesResponseDto,
    description: 'Paged list of active categories',
  })
  list(@Query() query: PublicListQueryDto): Promise<ListCategoriesResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.listCategories({
          page: query.page ?? 1,
          limit: query.limit ?? 20,
          activeOnly: true,
          parentId: '',
        }),
      ),
    );
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get active child categories' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({
    type: ListCategoriesResponseDto,
    description: 'Active child categories',
  })
  async getChildren(@Param('id') id: string): Promise<ListCategoriesResponse> {
    const response = await callGrpc(() =>
      firstValueFrom(this.productsClient.getCategoryChildren({ parentId: id })),
    );
    const items = (response.items ?? []).filter((item) => item.isActive);
    return {
      ...response,
      items,
      total: items.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get active category by id' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ type: CategoryResponseDto, description: 'Category detail' })
  async getById(@Param('id') id: string): Promise<CategoryResponse> {
    const category = await callGrpc(() =>
      firstValueFrom(this.productsClient.getCategory({ categoryId: id })),
    );
    if (!category.isActive) {
      throw new NotFoundException(`Category not found: ${id}`);
    }
    return category;
  }
}
