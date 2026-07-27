import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
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
import { CreateBrandDto } from './dto/products/create-brand.dto';
import { ListQueryDto } from './dto/products/list-query.dto';
import { SetActiveDto } from './dto/products/set-active.dto';
import { UpdateBrandDto } from './dto/products/update-brand.dto';
import { callGrpc } from './helpers/call-grpc.helper';

@ApiTags('brands')
@ApiBearerAuth('access-token')
@Controller('brands')
export class BrandsController {
  constructor(private readonly productsClient: ProductsClientPort) {}

  @Post()
  @ApiOperation({ summary: 'Create a brand' })
  @ApiBody({ type: CreateBrandDto })
  @ApiOkResponse({ description: 'Created brand' })
  create(@Body() body: CreateBrandDto): Promise<BrandResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.createBrand({
          name: body.name,
          slug: body.slug,
          logoUrl: body.logoUrl ?? '',
        }),
      ),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List brands' })
  @ApiOkResponse({ description: 'Paged list of brands' })
  list(@Query() query: ListQueryDto): Promise<ListBrandsResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.listBrands({
          page: query.page ?? 1,
          limit: query.limit ?? 20,
          activeOnly: query.activeOnly ?? false,
        }),
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by id' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ description: 'Brand detail' })
  getById(@Param('id') id: string): Promise<BrandResponse> {
    return callGrpc(() =>
      firstValueFrom(this.productsClient.getBrand({ brandId: id })),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a brand' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateBrandDto })
  @ApiOkResponse({ description: 'Updated brand' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateBrandDto,
  ): Promise<BrandResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.updateBrand({
          brandId: id,
          name: body.name ?? '',
          logoUrl: body.logoUrl ?? '',
          clearLogo: body.clearLogo ?? false,
        }),
      ),
    );
  }

  @Post(':id/active')
  @ApiOperation({ summary: 'Set brand active status' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: SetActiveDto })
  @ApiOkResponse({ description: 'Updated brand' })
  setActive(
    @Param('id') id: string,
    @Body() body: SetActiveDto,
  ): Promise<BrandResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.setBrandActive({
          brandId: id,
          isActive: body.isActive,
        }),
      ),
    );
  }
}
