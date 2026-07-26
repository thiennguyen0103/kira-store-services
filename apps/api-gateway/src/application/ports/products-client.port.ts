import { Observable } from 'rxjs';
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
  PingResponse,
  ProductResponse,
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

export abstract class ProductsClientPort {
  abstract ping(): Observable<PingResponse>;

  abstract createProduct(
    request: CreateProductRequest,
  ): Observable<ProductResponse>;

  abstract updateProduct(
    request: UpdateProductRequest,
  ): Observable<ProductResponse>;

  abstract getProduct(request: GetProductRequest): Observable<ProductResponse>;

  abstract getProductBySlug(
    request: GetProductBySlugRequest,
  ): Observable<ProductResponse>;

  abstract listProducts(
    request: ListProductsRequest,
  ): Observable<ListProductsResponse>;

  abstract publishProduct(
    request: PublishProductRequest,
  ): Observable<ProductResponse>;

  abstract archiveProduct(
    request: ArchiveProductRequest,
  ): Observable<ProductResponse>;

  abstract addVariant(request: AddVariantRequest): Observable<ProductResponse>;

  abstract updateVariant(
    request: UpdateVariantRequest,
  ): Observable<ProductResponse>;

  abstract removeVariant(
    request: RemoveVariantRequest,
  ): Observable<ProductResponse>;

  abstract setProductImages(
    request: SetProductImagesRequest,
  ): Observable<ProductResponse>;

  abstract adjustStock(
    request: AdjustStockRequest,
  ): Observable<ProductResponse>;

  abstract reserveStock(
    request: ReserveStockRequest,
  ): Observable<StockMutationResponse>;

  abstract releaseStock(
    request: ReleaseStockRequest,
  ): Observable<StockMutationResponse>;

  abstract createBrand(request: CreateBrandRequest): Observable<BrandResponse>;

  abstract updateBrand(request: UpdateBrandRequest): Observable<BrandResponse>;

  abstract getBrand(request: GetBrandRequest): Observable<BrandResponse>;

  abstract listBrands(
    request: ListBrandsRequest,
  ): Observable<ListBrandsResponse>;

  abstract setBrandActive(
    request: SetBrandActiveRequest,
  ): Observable<BrandResponse>;

  abstract createCategory(
    request: CreateCategoryRequest,
  ): Observable<CategoryResponse>;

  abstract updateCategory(
    request: UpdateCategoryRequest,
  ): Observable<CategoryResponse>;

  abstract getCategory(
    request: GetCategoryRequest,
  ): Observable<CategoryResponse>;

  abstract listCategories(
    request: ListCategoriesRequest,
  ): Observable<ListCategoriesResponse>;

  abstract getCategoryChildren(
    request: GetCategoryChildrenRequest,
  ): Observable<ListCategoriesResponse>;

  abstract setCategoryActive(
    request: SetCategoryActiveRequest,
  ): Observable<CategoryResponse>;
}
