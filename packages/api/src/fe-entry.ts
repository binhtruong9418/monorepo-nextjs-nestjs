// FE-safe entry point for apps/web.
//
// Enums and plain objects are exported as values (no decorators, safe in browser).
// All DTOs are exported as `export type` — TypeScript erases these at compile time,
// so no decorator code (@IsInt, @Type, PartialType) ever executes in the browser.

// Enums — runtime values, no decorators
export * from './constants/enums';

// Errors — runtime values (plain const objects, no decorators)
export { ErrorCodes, ERROR_MESSAGES } from './errors';
export type { ErrorCode } from './errors';

// Pagination — types only
export type { Order, PageOptionsDto } from './dtos/page-option.dto';
export type { PageMetaDto } from './dtos/page-meta.dto';
export type { PageDto } from './dtos/page.dto';

// Category DTOs — types only
export type { CreateCategoryDto } from './dtos/category/create-category.dto';
export type { UpdateCategoryDto } from './dtos/category/update-category.dto';
export type { QueryCategoryDto } from './dtos/category/query-category.dto';
export type { CategoryResponseDto } from './dtos/category/category-response.dto';

// Product DTOs — types only
export type { CreateProductDto } from './dtos/product/create-product.dto';
export type { UpdateProductDto } from './dtos/product/update-product.dto';
export type { QueryProductDto } from './dtos/product/query-product.dto';
export type { ProductResponseDto } from './dtos/product/product-response.dto';
