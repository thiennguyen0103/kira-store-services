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
import { UserRole } from 'libs/shared/enums/user-role.enum';
import type {
  CategoryResponse,
  ListCategoriesResponse,
} from 'libs/shared/generated/products';
import { ProductsClientPort } from '../../application/ports/products-client.port';
import { Roles } from '../decorators/roles.decorator';
import { CreateCategoryDto } from '../dto/products/create-category.dto';
import { ListQueryDto } from '../dto/products/list-query.dto';
import { SetActiveDto } from '../dto/products/set-active.dto';
import { UpdateCategoryDto } from '../dto/products/update-category.dto';
import { callGrpc } from '../helpers/call-grpc.helper';

@ApiTags('admin-categories')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly productsClient: ProductsClientPort) {}

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiOkResponse({ description: 'Created category' })
  create(@Body() body: CreateCategoryDto): Promise<CategoryResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.createCategory({
          name: body.name,
          slug: body.slug,
          parentId: body.parentId ?? '',
        }),
      ),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List categories' })
  @ApiOkResponse({ description: 'Paged list of categories' })
  list(@Query() query: ListQueryDto): Promise<ListCategoriesResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.listCategories({
          page: query.page ?? 1,
          limit: query.limit ?? 20,
          activeOnly: query.activeOnly ?? false,
          parentId: '',
        }),
      ),
    );
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get child categories' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ description: 'Child categories' })
  getChildren(@Param('id') id: string): Promise<ListCategoriesResponse> {
    return callGrpc(() =>
      firstValueFrom(this.productsClient.getCategoryChildren({ parentId: id })),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOkResponse({ description: 'Category detail' })
  getById(@Param('id') id: string): Promise<CategoryResponse> {
    return callGrpc(() =>
      firstValueFrom(this.productsClient.getCategory({ categoryId: id })),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOkResponse({ description: 'Updated category' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.updateCategory({
          categoryId: id,
          name: body.name,
        }),
      ),
    );
  }

  @Post(':id/active')
  @ApiOperation({ summary: 'Set category active status' })
  @ApiParam({
    name: 'id',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({ type: SetActiveDto })
  @ApiOkResponse({ description: 'Updated category' })
  setActive(
    @Param('id') id: string,
    @Body() body: SetActiveDto,
  ): Promise<CategoryResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.productsClient.setCategoryActive({
          categoryId: id,
          isActive: body.isActive,
        }),
      ),
    );
  }
}
