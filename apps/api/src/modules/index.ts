import { Type } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';

export const MODULES: Type[] = [CategoryModule, ProductModule];
