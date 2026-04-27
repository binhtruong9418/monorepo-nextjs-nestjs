import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../../constants/enums';
import { PageOptionsDto } from '../page-option.dto';

export class QueryProductDto extends PageOptionsDto {
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
