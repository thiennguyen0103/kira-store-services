import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { CreateCategoryCommand } from 'apps/products-service/src/application/commands/create-category/create-category.command';
import { SetCategoryActiveCommand } from 'apps/products-service/src/application/commands/set-category-active/set-category-active.command';
import { UpdateCategoryCommand } from 'apps/products-service/src/application/commands/update-category/update-category.command';
import { CategoryDto } from 'apps/products-service/src/application/dto/category.dto';
import { GetCategoryChildrenQuery } from 'apps/products-service/src/application/queries/get-category-children/get-category-children.query';
import { GetCategoryQuery } from 'apps/products-service/src/application/queries/get-category/get-category.query';
import { ListCategoriesQuery } from 'apps/products-service/src/application/queries/list-categories/list-categories.query';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListQueryDto } from './dto/list-query.dto';
import { SetActiveDto } from './dto/set-active.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Body() body: CreateCategoryDto): Promise<CategoryDto> {
    return this.commandBus.execute(
      new CreateCategoryCommand(body.name, body.slug, body.parentId),
    );
  }

  @Get()
  list(@Query() query: ListQueryDto): Promise<PagedResultDto<CategoryDto>> {
    return this.queryBus.execute(
      new ListCategoriesQuery(
        query.page ?? 1,
        query.limit ?? 20,
        query.activeOnly,
      ),
    );
  }

  @Get(':id/children')
  getChildren(@Param('id') id: string): Promise<CategoryDto[]> {
    return this.queryBus.execute(new GetCategoryChildrenQuery(id));
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<CategoryDto> {
    return this.queryBus.execute(new GetCategoryQuery(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    return this.commandBus.execute(new UpdateCategoryCommand(id, body.name));
  }

  @Post(':id/active')
  setActive(
    @Param('id') id: string,
    @Body() body: SetActiveDto,
  ): Promise<CategoryDto> {
    return this.commandBus.execute(
      new SetCategoryActiveCommand(id, body.isActive),
    );
  }
}
