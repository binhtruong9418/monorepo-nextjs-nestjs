import { CategoryStatus } from '../../constants/enums';
import { CategoryEntity } from '../../entities/category.entity';

export class CategoryResponseDto {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function toCategoryDto(e: CategoryEntity): CategoryResponseDto {
  const dto = new CategoryResponseDto();
  dto.id = e.id;
  dto.name = e.name;
  dto.slug = e.slug;
  dto.description = e.description;
  dto.status = e.status;
  dto.createdAt = e.createdAt;
  dto.updatedAt = e.updatedAt;
  return dto;
}
