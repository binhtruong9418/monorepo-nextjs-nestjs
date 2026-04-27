import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryStatus } from '../../constants/enums';
import { PageOptionsDto } from '../page-option.dto';

export class QueryCategoryDto extends PageOptionsDto {
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
