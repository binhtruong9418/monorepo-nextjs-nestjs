import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ProductStatus } from '../../constants/enums';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(220)
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number = 0;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.ACTIVE;

  @IsOptional()
  @IsInt()
  categoryId?: number;
}
