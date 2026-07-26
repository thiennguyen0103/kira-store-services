import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  appConfigOptions,
  createTypeOrmRootModule,
  productsServiceEnvSchema,
} from 'libs/shared/config';
import { QUEUE_NAMES } from 'libs/shared/constants';
import { EventPublisher } from 'libs/shared/interfaces';
import { createLoggerModule } from 'libs/shared/logging';
import { getRabbitMqUrl } from 'libs/shared/microservices';
import { AddVariantHandler } from 'apps/products-service/src/application/commands/add-variant/add-variant.handler';
import { AdjustStockHandler } from 'apps/products-service/src/application/commands/adjust-stock/adjust-stock.handler';
import { ArchiveProductHandler } from 'apps/products-service/src/application/commands/archive-product/archive-product.handler';
import { CreateBrandHandler } from 'apps/products-service/src/application/commands/create-brand/create-brand.handler';
import { CreateCategoryHandler } from 'apps/products-service/src/application/commands/create-category/create-category.handler';
import { CreateProductHandler } from 'apps/products-service/src/application/commands/create-product/create-product.handler';
import { PublishProductHandler } from 'apps/products-service/src/application/commands/publish-product/publish-product.handler';
import { ReleaseStockHandler } from 'apps/products-service/src/application/commands/release-stock/release-stock.handler';
import { RemoveVariantHandler } from 'apps/products-service/src/application/commands/remove-variant/remove-variant.handler';
import { ReserveStockHandler } from 'apps/products-service/src/application/commands/reserve-stock/reserve-stock.handler';
import { SetBrandActiveHandler } from 'apps/products-service/src/application/commands/set-brand-active/set-brand-active.handler';
import { SetCategoryActiveHandler } from 'apps/products-service/src/application/commands/set-category-active/set-category-active.handler';
import { SetProductImagesHandler } from 'apps/products-service/src/application/commands/set-product-images/set-product-images.handler';
import { UpdateBrandHandler } from 'apps/products-service/src/application/commands/update-brand/update-brand.handler';
import { UpdateCategoryHandler } from 'apps/products-service/src/application/commands/update-category/update-category.handler';
import { UpdateProductHandler } from 'apps/products-service/src/application/commands/update-product/update-product.handler';
import { UpdateVariantHandler } from 'apps/products-service/src/application/commands/update-variant/update-variant.handler';
import { BrandQueryRepository } from 'apps/products-service/src/application/queries/repositories/brand-query.repository';
import { CategoryQueryRepository } from 'apps/products-service/src/application/queries/repositories/category-query.repository';
import { ProductQueryRepository } from 'apps/products-service/src/application/queries/repositories/product-query.repository';
import { GetBrandHandler } from 'apps/products-service/src/application/queries/get-brand/get-brand.handler';
import { GetCategoryChildrenHandler } from 'apps/products-service/src/application/queries/get-category-children/get-category-children.handler';
import { GetCategoryHandler } from 'apps/products-service/src/application/queries/get-category/get-category.handler';
import { GetProductBySlugHandler } from 'apps/products-service/src/application/queries/get-product-by-slug/get-product-by-slug.handler';
import { GetProductHandler } from 'apps/products-service/src/application/queries/get-product/get-product.handler';
import { ListBrandsHandler } from 'apps/products-service/src/application/queries/list-brands/list-brands.handler';
import { ListCategoriesHandler } from 'apps/products-service/src/application/queries/list-categories/list-categories.handler';
import { ListProductsHandler } from 'apps/products-service/src/application/queries/list-products/list-products.handler';
import { BrandRepository } from 'apps/products-service/src/domain/repositories/brand.repository';
import { CategoryRepository } from 'apps/products-service/src/domain/repositories/category.repository';
import { ProductRepository } from 'apps/products-service/src/domain/repositories/product.repository';
import { OrderEventsSubscriber } from 'apps/products-service/src/infrastructure/messaging/order-events.subscriber';
import {
  PRODUCTS_EVENT_CLIENT,
  RmqEventPublisher,
} from 'apps/products-service/src/infrastructure/messaging/product-events.publisher';
import { BrandOrmEntity } from 'apps/products-service/src/infrastructure/persistence/entities/brand.orm-entity';
import { CategoryOrmEntity } from 'apps/products-service/src/infrastructure/persistence/entities/category.orm-entity';
import { ProductImageOrmEntity } from 'apps/products-service/src/infrastructure/persistence/entities/product-image.orm-entity';
import { ProductVariantOrmEntity } from 'apps/products-service/src/infrastructure/persistence/entities/product-variant.orm-entity';
import { ProductOrmEntity } from 'apps/products-service/src/infrastructure/persistence/entities/product.orm-entity';
import { BrandPersistenceMapper } from 'apps/products-service/src/infrastructure/persistence/mappers/brand-persistence.mapper';
import { CategoryPersistenceMapper } from 'apps/products-service/src/infrastructure/persistence/mappers/category-persistence.mapper';
import { ProductPersistenceMapper } from 'apps/products-service/src/infrastructure/persistence/mappers/product-persistence.mapper';
import { TypeOrmBrandQueryRepository } from 'apps/products-service/src/infrastructure/persistence/repositories/typeorm-brand-query.repository';
import { TypeOrmBrandRepository } from 'apps/products-service/src/infrastructure/persistence/repositories/typeorm-brand.repository';
import { TypeOrmCategoryQueryRepository } from 'apps/products-service/src/infrastructure/persistence/repositories/typeorm-category-query.repository';
import { TypeOrmCategoryRepository } from 'apps/products-service/src/infrastructure/persistence/repositories/typeorm-category.repository';
import { TypeOrmProductQueryRepository } from 'apps/products-service/src/infrastructure/persistence/repositories/typeorm-product-query.repository';
import { TypeOrmProductRepository } from 'apps/products-service/src/infrastructure/persistence/repositories/typeorm-product.repository';
import { BrandsHttpController } from './presentation/brands.http.controller';
import { CategoriesHttpController } from './presentation/categories.http.controller';
import { ProductsGrpcController } from './presentation/products.grpc.controller';
import { ProductsHttpController } from './presentation/products.http.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('products-service', productsServiceEnvSchema),
    ),
    createLoggerModule('products-service'),
    createTypeOrmRootModule(),
    TypeOrmModule.forFeature([
      ProductOrmEntity,
      ProductVariantOrmEntity,
      ProductImageOrmEntity,
      BrandOrmEntity,
      CategoryOrmEntity,
    ]),
    CqrsModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: PRODUCTS_EVENT_CLIENT,
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [getRabbitMqUrl()],
            queue: QUEUE_NAMES.ORDERS,
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [
    ProductsGrpcController,
    ProductsHttpController,
    BrandsHttpController,
    CategoriesHttpController,
    OrderEventsSubscriber,
  ],
  providers: [
    CreateProductHandler,
    UpdateProductHandler,
    PublishProductHandler,
    ArchiveProductHandler,
    AddVariantHandler,
    UpdateVariantHandler,
    RemoveVariantHandler,
    SetProductImagesHandler,
    AdjustStockHandler,
    ReserveStockHandler,
    ReleaseStockHandler,
    CreateBrandHandler,
    UpdateBrandHandler,
    SetBrandActiveHandler,
    CreateCategoryHandler,
    UpdateCategoryHandler,
    SetCategoryActiveHandler,
    GetProductHandler,
    GetProductBySlugHandler,
    ListProductsHandler,
    GetBrandHandler,
    ListBrandsHandler,
    GetCategoryHandler,
    ListCategoriesHandler,
    GetCategoryChildrenHandler,
    ProductPersistenceMapper,
    BrandPersistenceMapper,
    CategoryPersistenceMapper,
    { provide: ProductRepository, useClass: TypeOrmProductRepository },
    { provide: BrandRepository, useClass: TypeOrmBrandRepository },
    { provide: CategoryRepository, useClass: TypeOrmCategoryRepository },
    {
      provide: ProductQueryRepository,
      useClass: TypeOrmProductQueryRepository,
    },
    { provide: BrandQueryRepository, useClass: TypeOrmBrandQueryRepository },
    {
      provide: CategoryQueryRepository,
      useClass: TypeOrmCategoryQueryRepository,
    },
    { provide: EventPublisher, useClass: RmqEventPublisher },
  ],
})
export class ProductsServiceModule {}
