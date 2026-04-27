import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/base-entity';
import { ProductStatus } from '../constants/enums';
import type { CategoryEntity } from './category.entity';

@Entity({ name: 'products' })
export class ProductEntity extends BaseEntity {
  @Column({ name: 'name', length: 200 })
  name: string;

  @Column({ name: 'slug', length: 220, unique: true })
  slug: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'price', type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ name: 'stock', type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'status', type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number | null;

  @ManyToOne('CategoryEntity', (cat: CategoryEntity) => cat.products, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
}
