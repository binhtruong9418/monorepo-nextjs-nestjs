import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/base-entity';
import { CategoryStatus } from '../constants/enums';
import type { ProductEntity } from './product.entity';

@Entity({ name: 'categories' })
export class CategoryEntity extends BaseEntity {
  @Column({ name: 'name', length: 100 })
  name: string;

  @Column({ name: 'slug', length: 120, unique: true })
  slug: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'status', type: 'enum', enum: CategoryStatus, default: CategoryStatus.ACTIVE })
  status: CategoryStatus;

  @OneToMany('ProductEntity', (product: ProductEntity) => product.category)
  products: ProductEntity[];
}
