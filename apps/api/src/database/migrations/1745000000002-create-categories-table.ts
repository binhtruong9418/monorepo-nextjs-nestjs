import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCategoriesTable1745000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "category_status_enum" AS ENUM ('active', 'inactive')`);

    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'slug', type: 'varchar', length: '120', isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'status', type: 'category_status_enum', default: `'active'` },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
    );

    await queryRunner.createIndex('categories', new TableIndex({ name: 'IDX_CATEGORIES_SLUG', columnNames: ['slug'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('categories', 'IDX_CATEGORIES_SLUG');
    await queryRunner.dropTable('categories');
    await queryRunner.query(`DROP TYPE "category_status_enum"`);
  }
}
