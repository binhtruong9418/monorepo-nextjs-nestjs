import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateProductsTable1745000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "product_status_enum" AS ENUM ('active', 'inactive', 'draft', 'out_of_stock')`,
    );

    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '200' },
          { name: 'slug', type: 'varchar', length: '220', isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'price', type: 'decimal', precision: 12, scale: 2 },
          { name: 'stock', type: 'int', default: 0 },
          { name: 'status', type: 'product_status_enum', default: `'active'` },
          { name: 'category_id', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
    );

    await queryRunner.createIndex('products', new TableIndex({ name: 'IDX_PRODUCTS_SLUG', columnNames: ['slug'] }));
    await queryRunner.createIndex('products', new TableIndex({ name: 'IDX_PRODUCTS_CATEGORY_ID', columnNames: ['category_id'] }));

    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        name: 'FK_PRODUCTS_CATEGORY',
        columnNames: ['category_id'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('products', 'FK_PRODUCTS_CATEGORY');
    await queryRunner.dropIndex('products', 'IDX_PRODUCTS_CATEGORY_ID');
    await queryRunner.dropIndex('products', 'IDX_PRODUCTS_SLUG');
    await queryRunner.dropTable('products');
    await queryRunner.query(`DROP TYPE "product_status_enum"`);
  }
}
