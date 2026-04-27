import { ProductStatus } from '../../constants/enums';
import { ProductEntity } from '../../entities/product.entity';

export class ProductResponseDto {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  categoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toProductDto(e: ProductEntity): ProductResponseDto {
  const dto = new ProductResponseDto();
  dto.id = e.id;
  dto.name = e.name;
  dto.slug = e.slug;
  dto.description = e.description;
  dto.price = Number(e.price); // TypeORM returns decimal columns as strings
  dto.stock = e.stock;
  dto.status = e.status;
  dto.categoryId = e.categoryId;
  dto.createdAt = e.createdAt;
  dto.updatedAt = e.updatedAt;
  return dto;
}
