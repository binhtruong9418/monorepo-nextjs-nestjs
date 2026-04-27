import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CategoryStatus } from '../../constants/enums';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus = CategoryStatus.ACTIVE;
}
