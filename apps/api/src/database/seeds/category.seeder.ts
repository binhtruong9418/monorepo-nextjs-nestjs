import { DataSource } from 'typeorm';
import { CategoryEntity, CategoryStatus } from '@repo/api';

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', description: 'Phones, laptops, and gadgets', status: CategoryStatus.ACTIVE },
  { name: 'Clothing', slug: 'clothing', description: 'Men and women apparel', status: CategoryStatus.ACTIVE },
  { name: 'Books', slug: 'books', description: 'Fiction, non-fiction, and textbooks', status: CategoryStatus.ACTIVE },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Furniture, decor, and gardening tools', status: CategoryStatus.ACTIVE },
  { name: 'Sports', slug: 'sports', description: 'Equipment and activewear', status: CategoryStatus.INACTIVE },
];

export class CategorySeeder {
  async run(dataSource: DataSource): Promise<CategoryEntity[]> {
    const repo = dataSource.getRepository(CategoryEntity);
    const result: CategoryEntity[] = [];

    for (const data of CATEGORIES) {
      const existing = await repo.findOne({ where: { slug: data.slug } });
      if (existing) {
        console.log(`  [skip] category "${data.slug}" already exists`);
        result.push(existing);
        continue;
      }
      const entity = repo.create(data);
      const saved = await repo.save(entity);
      console.log(`  [seed] category "${saved.slug}" created (id=${saved.id})`);
      result.push(saved);
    }

    return result;
  }
}
