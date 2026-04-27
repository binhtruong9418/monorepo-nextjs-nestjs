import { DataSource } from 'typeorm';
import { CategoryEntity, ProductEntity, ProductStatus } from '@repo/api';

const buildProducts = (categories: CategoryEntity[]) => {
  const bySlug = (slug: string) => categories.find((c) => c.slug === slug);

  return [
    // Electronics
    { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', description: '6.1-inch display, A17 Pro chip', price: 999.99, stock: 50, status: ProductStatus.ACTIVE, category: bySlug('electronics') },
    { name: 'MacBook Air M3', slug: 'macbook-air-m3', description: '15-inch, 16GB RAM, 512GB SSD', price: 1299.99, stock: 30, status: ProductStatus.ACTIVE, category: bySlug('electronics') },
    { name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', description: 'Noise-cancelling wireless headphones', price: 349.99, stock: 0, status: ProductStatus.OUT_OF_STOCK, category: bySlug('electronics') },
    { name: 'Samsung 4K Monitor', slug: 'samsung-4k-monitor', description: '27-inch UHD IPS display', price: 499.99, stock: 15, status: ProductStatus.ACTIVE, category: bySlug('electronics') },

    // Clothing
    { name: 'Classic White T-Shirt', slug: 'classic-white-tshirt', description: '100% organic cotton', price: 29.99, stock: 200, status: ProductStatus.ACTIVE, category: bySlug('clothing') },
    { name: 'Slim Fit Jeans', slug: 'slim-fit-jeans', description: 'Stretch denim, dark wash', price: 79.99, stock: 120, status: ProductStatus.ACTIVE, category: bySlug('clothing') },
    { name: 'Winter Parka', slug: 'winter-parka', description: 'Water-resistant, faux fur hood', price: 189.99, stock: 45, status: ProductStatus.DRAFT, category: bySlug('clothing') },

    // Books
    { name: 'Clean Code', slug: 'clean-code', description: 'A Handbook of Agile Software Craftsmanship by Robert C. Martin', price: 39.99, stock: 80, status: ProductStatus.ACTIVE, category: bySlug('books') },
    { name: 'The Pragmatic Programmer', slug: 'pragmatic-programmer', description: '20th Anniversary Edition', price: 49.99, stock: 60, status: ProductStatus.ACTIVE, category: bySlug('books') },
    { name: 'Designing Data-Intensive Applications', slug: 'ddia', description: 'By Martin Kleppmann', price: 59.99, stock: 40, status: ProductStatus.ACTIVE, category: bySlug('books') },

    // Home & Garden
    { name: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair', description: 'Lumbar support, adjustable armrests', price: 349.99, stock: 25, status: ProductStatus.ACTIVE, category: bySlug('home-garden') },
    { name: 'Ceramic Plant Pot Set', slug: 'ceramic-plant-pot-set', description: 'Set of 3, assorted sizes', price: 34.99, stock: 150, status: ProductStatus.ACTIVE, category: bySlug('home-garden') },
  ];
};

export class ProductSeeder {
  async run(dataSource: DataSource, categories: CategoryEntity[]): Promise<void> {
    const repo = dataSource.getRepository(ProductEntity);
    const products = buildProducts(categories);

    for (const data of products) {
      const existing = await repo.findOne({ where: { slug: data.slug } });
      if (existing) {
        console.log(`  [skip] product "${data.slug}" already exists`);
        continue;
      }
      const entity = repo.create(data);
      const saved = await repo.save(entity);
      console.log(`  [seed] product "${saved.slug}" created (id=${saved.id})`);
    }
  }
}
