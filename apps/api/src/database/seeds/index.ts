import AppDataSource from '../../data-source';
import { CategorySeeder } from './category.seeder';
import { ProductSeeder } from './product.seeder';

async function runSeeds() {
  await AppDataSource.initialize();
  console.log('Database connected. Running seeds...\n');

  console.log('Seeding categories...');
  const categories = await new CategorySeeder().run(AppDataSource);

  console.log('\nSeeding products...');
  await new ProductSeeder().run(AppDataSource, categories);

  await AppDataSource.destroy();
  console.log('\nSeeds completed.');
}

runSeeds().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
