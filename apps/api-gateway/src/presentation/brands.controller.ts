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
  BrandResponse,
  ListBrandsResponse,
} from 'libs/shared/generated/products';
import { ProductsClientPort } from '../application/ports/products-client.port';
import { Public } from './decorators/public.decorator';
import {
  BrandResponseDto,
  ListBrandsResponseDto,
} from './dto/products/product-response.dto';
import { PublicListQueryDto } from './dto/products/public-list-query.dto';
import { callGrpc } from './helpers/call-grpc.helper';

@ApiTags('brands')
@Public()
@Controller('brands')
export class BrandsController {
  constructor(private readonly productsClient: ProductsClientPort) {}

  @Get()
  @ApiOperation({ summary: 'List active brands' })
  @ApiOkResponse({
    type: ListBrandsResponseDto,
    description: 'Paged list of active brands',
  })
  list(@Query() query: PublicListQueryDto): Promise<ListBrandsResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.listBrands({
          page: query.page ?? 1,
          limit: query.limit ?? 20,
          activeOnly: true,
        }),
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get active brand by id' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ type: BrandResponseDto, description: 'Brand detail' })
  async getById(@Param('id') id: string): Promise<BrandResponse> {
    const brand = await callGrpc(() =>
      firstValueFrom(this.productsClient.getBrand({ brandId: id })),
    );
    if (!brand.isActive) {
      throw new NotFoundException(`Brand not found: ${id}`);
    }
    return brand;
  }
}
