import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
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
  ProductsServiceClient,
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
import { ProductsClientPort } from '../../application/ports/products-client.port';

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

  ping(): Observable<PingResponse> {
    return this.productsService.ping({});
  }

  createProduct(request: CreateProductRequest): Observable<ProductResponse> {
    return this.productsService.createProduct(request);
  }

  updateProduct(request: UpdateProductRequest): Observable<ProductResponse> {
    return this.productsService.updateProduct(request);
  }

  getProduct(request: GetProductRequest): Observable<ProductResponse> {
    return this.productsService.getProduct(request);
  }

  getProductBySlug(
    request: GetProductBySlugRequest,
  ): Observable<ProductResponse> {
    return this.productsService.getProductBySlug(request);
  }

  listProducts(request: ListProductsRequest): Observable<ListProductsResponse> {
    return this.productsService.listProducts(request);
  }

  publishProduct(request: PublishProductRequest): Observable<ProductResponse> {
    return this.productsService.publishProduct(request);
  }

  archiveProduct(request: ArchiveProductRequest): Observable<ProductResponse> {
    return this.productsService.archiveProduct(request);
  }

  addVariant(request: AddVariantRequest): Observable<ProductResponse> {
    return this.productsService.addVariant(request);
  }

  updateVariant(request: UpdateVariantRequest): Observable<ProductResponse> {
    return this.productsService.updateVariant(request);
  }

  removeVariant(request: RemoveVariantRequest): Observable<ProductResponse> {
    return this.productsService.removeVariant(request);
  }

  setProductImages(
    request: SetProductImagesRequest,
  ): Observable<ProductResponse> {
    return this.productsService.setProductImages(request);
  }

  adjustStock(request: AdjustStockRequest): Observable<ProductResponse> {
    return this.productsService.adjustStock(request);
  }

  reserveStock(
    request: ReserveStockRequest,
  ): Observable<StockMutationResponse> {
    return this.productsService.reserveStock(request);
  }

  releaseStock(
    request: ReleaseStockRequest,
  ): Observable<StockMutationResponse> {
    return this.productsService.releaseStock(request);
  }

  createBrand(request: CreateBrandRequest): Observable<BrandResponse> {
    return this.productsService.createBrand(request);
  }

  updateBrand(request: UpdateBrandRequest): Observable<BrandResponse> {
    return this.productsService.updateBrand(request);
  }

  getBrand(request: GetBrandRequest): Observable<BrandResponse> {
    return this.productsService.getBrand(request);
  }

  listBrands(request: ListBrandsRequest): Observable<ListBrandsResponse> {
    return this.productsService.listBrands(request);
  }

  setBrandActive(request: SetBrandActiveRequest): Observable<BrandResponse> {
    return this.productsService.setBrandActive(request);
  }

  createCategory(request: CreateCategoryRequest): Observable<CategoryResponse> {
    return this.productsService.createCategory(request);
  }

  updateCategory(request: UpdateCategoryRequest): Observable<CategoryResponse> {
    return this.productsService.updateCategory(request);
  }

  getCategory(request: GetCategoryRequest): Observable<CategoryResponse> {
    return this.productsService.getCategory(request);
  }

  listCategories(
    request: ListCategoriesRequest,
  ): Observable<ListCategoriesResponse> {
    return this.productsService.listCategories(request);
  }

  getCategoryChildren(
    request: GetCategoryChildrenRequest,
  ): Observable<ListCategoriesResponse> {
    return this.productsService.getCategoryChildren(request);
  }

  setCategoryActive(
    request: SetCategoryActiveRequest,
  ): Observable<CategoryResponse> {
    return this.productsService.setCategoryActive(request);
  }
}
