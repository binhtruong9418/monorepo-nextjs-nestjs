import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

const ALLOWED_ORDER_BY = ['createdAt', 'updatedAt', 'id', 'name'] as const;

export class PageOptionsDto {
  @IsOptional()
  @IsIn(ALLOWED_ORDER_BY)
  readonly orderBy: string = 'createdAt';

  @IsEnum(Order)
  @IsOptional()
  readonly direction: Order = Order.DESC;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
