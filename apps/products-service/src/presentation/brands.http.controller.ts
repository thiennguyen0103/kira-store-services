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
import { CreateBrandCommand } from 'apps/products-service/src/application/commands/create-brand/create-brand.command';
import { SetBrandActiveCommand } from 'apps/products-service/src/application/commands/set-brand-active/set-brand-active.command';
import { UpdateBrandCommand } from 'apps/products-service/src/application/commands/update-brand/update-brand.command';
import { BrandDto } from 'apps/products-service/src/application/dto/brand.dto';
import { GetBrandQuery } from 'apps/products-service/src/application/queries/get-brand/get-brand.query';
import { ListBrandsQuery } from 'apps/products-service/src/application/queries/list-brands/list-brands.query';
import { CreateBrandDto } from './dto/create-brand.dto';
import { ListQueryDto } from './dto/list-query.dto';
import { SetActiveDto } from './dto/set-active.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@ApiTags('brands')
@Controller('brands')
export class BrandsHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Body() body: CreateBrandDto): Promise<BrandDto> {
    return this.commandBus.execute(
      new CreateBrandCommand(body.name, body.slug, body.logoUrl),
    );
  }

  @Get()
  list(@Query() query: ListQueryDto): Promise<PagedResultDto<BrandDto>> {
    return this.queryBus.execute(
      new ListBrandsQuery(query.page ?? 1, query.limit ?? 20, query.activeOnly),
    );
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<BrandDto> {
    return this.queryBus.execute(new GetBrandQuery(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateBrandDto,
  ): Promise<BrandDto> {
    return this.commandBus.execute(
      new UpdateBrandCommand(id, body.name, body.logoUrl, body.clearLogo),
    );
  }

  @Post(':id/active')
  setActive(
    @Param('id') id: string,
    @Body() body: SetActiveDto,
  ): Promise<BrandDto> {
    return this.commandBus.execute(
      new SetBrandActiveCommand(id, body.isActive),
    );
  }
}
