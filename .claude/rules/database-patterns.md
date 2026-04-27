# Database Patterns (TypeORM + PostgreSQL)

## Entity Rules

- All entities extend one of the base classes from `@repo/api`:
  - `BaseEntity` — has `id`, `createdAt`, `updatedAt`, `deletedAt` (soft-delete)
  - `BaseEntityWithoutSoftDelete` — has `id`, `createdAt`, `updatedAt` (hard-delete)
  - `BaseIdEntity` — has `id` only (for junction/pivot tables)
- Shared entities (used by both BE and FE) → `packages/@repo/api/src/entities/`
- Local-only entities (BE-only, e.g. audit logs) → `apps/api/src/database/entities/`
- Every entity added to `packages/@repo/api` **must** also be registered in `apps/api/src/data-source.ts`
- Column names: `snake_case` via `{ name: 'column_name' }` — TypeScript property stays `camelCase`
- Never use `synchronize: true` — always generate and run migrations

```ts
// Correct
@Column({ name: 'product_id' })
productId: number;

// Wrong — relies on TypeORM default which may differ
@Column()
productId: number;
```

## Enums in DB

- Store enum values as strings in the DB — use `{ type: 'enum', enum: MyEnum }` on the column
- Enums defined in `packages/@repo/api/src/constants/enums.ts` — never redefine locally
- PostgreSQL native enum: use TypeORM `enum` column type; it creates a PG enum type automatically

```ts
@Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
status: OrderStatus;
```

## Migrations

### Writing migrations manually (preferred)

Write migrations by hand using the QueryRunner API — do not rely on auto-generate when entities live in `@repo/api` (the CLI cannot always resolve the shared package correctly). Auto-generate is only useful as a diff preview; always review and clean up the output before committing.

File location: `apps/api/src/database/migrations/<timestamp>-<kebab-description>.ts`
Naming: use a 13-digit Unix ms timestamp prefix (e.g. `1745000000001`) and a descriptive suffix.

```ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateOrdersTable1745000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create custom PG enum types first
    await queryRunner.query(`CREATE TYPE "order_status_enum" AS ENUM ('pending', 'paid', 'shipped', 'cancelled')`);

    // 2. Create the table
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'int' },
          { name: 'status', type: 'order_status_enum', default: `'pending'` },
          { name: 'total', type: 'decimal', precision: 12, scale: 2 },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
    );

    // 3. Add indexes
    await queryRunner.createIndex('orders', new TableIndex({ name: 'IDX_ORDERS_USER_ID', columnNames: ['user_id'] }));

    // 4. Add foreign keys last
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'FK_ORDERS_USER',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse order: FK → index → table → enum
    await queryRunner.dropForeignKey('orders', 'FK_ORDERS_USER');
    await queryRunner.dropIndex('orders', 'IDX_ORDERS_USER_ID');
    await queryRunner.dropTable('orders');
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
  }
}
```

### Migration naming conventions

- Index names: `IDX_<TABLE>_<COLUMN>` (e.g. `IDX_PRODUCTS_SLUG`)
- Foreign key names: `FK_<TABLE>_<RELATION>` (e.g. `FK_PRODUCTS_CATEGORY`)
- PG enum types: `<column>_enum` (e.g. `product_status_enum`)
- `down()` must fully reverse `up()` in reverse order: drop FK → drop index → drop table → drop enum

### Running migrations

```bash
# Build @repo/api first — entities and TypeORM decorators live there
yarn workspace @repo/api build

# Show pending migrations
yarn workspace api migration:show

# Run all pending
yarn workspace api migration:run

# Revert last applied
yarn workspace api migration:revert

# Auto-generate a diff (for reference only — review before using)
yarn workspace api migration:generate src/database/migrations/<DescriptiveName>
```

### Rules

- Never edit a migration that has already been run in any environment
- Each migration should do one logical thing — don't bundle unrelated tables
- Always write `down()` so rollbacks work — even if you never expect to use it
- The `data-source.ts` migration glob `src/database/migrations/**/*.{ts,js}` picks up files automatically — no manual registration needed

## Repositories

- Extend `BaseRepository<T>` for feature-specific query methods
- Register with `TypeOrmModule.forFeature([Entity])` in the feature module
- Use `@InjectRepository(Entity)` in the service constructor
- Complex queries → use `createQueryBuilder`, never raw SQL strings
- For read-heavy endpoints, select only needed columns: `.select(['entity.id', 'entity.name'])`

```ts
// Correct — parameterized, specific columns
async findActiveProducts(): Promise<Product[]> {
  return this.createQueryBuilder('product')
    .select(['product.id', 'product.name', 'product.price'])
    .where('product.status = :status', { status: ProductStatus.ACTIVE })
    .orderBy('product.createdAt', 'DESC')
    .getMany();
}
```

## Soft Delete

- Always use soft-delete for user-facing data (products, orders, users) — `BaseEntity` handles this
- Call `repo.softDelete(id)` or `repo.softRemove(entity)` — never `repo.delete()`
- Default queries automatically exclude soft-deleted rows — TypeORM handles this via `DeleteDateColumn`
- To include deleted rows: `.withDeleted()` on the query builder
- Use `BaseEntityWithoutSoftDelete` only for logs, audit trails, or ephemeral data

## Relations

- Define relations on both sides (owner + inverse) for clarity
- Use `@JoinColumn({ name: 'foreign_key_column' })` explicitly on the owning side
- Lazy loading is disabled — always use `relations: ['relation']` or `leftJoinAndSelect` explicitly
- Avoid N+1: use `QueryBuilder` with joins instead of loading relations in a loop

```ts
// Correct — single query with join
return this.createQueryBuilder('order')
  .leftJoinAndSelect('order.items', 'item')
  .leftJoinAndSelect('item.product', 'product')
  .where('order.id = :id', { id })
  .getOne();

// Wrong — N+1 problem
const order = await this.repo.findOne({ where: { id } });
const items = await Promise.all(order.items.map(i => this.itemRepo.findOne(i.id)));
```

## Transactions

- Use `DataSource.transaction()` for multi-step operations that must be atomic
- Inject `DataSource` via constructor when transactions are needed in a service
- Never span transactions across HTTP requests

```ts
await this.dataSource.transaction(async (manager) => {
  await manager.save(Order, order);
  await manager.save(Payment, payment);
  await manager.decrement(Product, { id: productId }, 'stock', quantity);
});
```

## Seeding

- Seeds live in `apps/api/src/database/seeds/`
- Run with `yarn workspace api seed:run`
- Seeds are idempotent — check for existence before inserting (use `findOne({ where: { slug } })`)
- Seed runner at `apps/api/src/database/seeds/index.ts` initializes its own DataSource — run migrations first
- Never seed in production unless explicitly triggered via admin action

```ts
// Correct — idempotent seeder
export class ProductSeeder {
  async run(dataSource: DataSource, categories: CategoryEntity[]): Promise<void> {
    const repo = dataSource.getRepository(ProductEntity);
    for (const data of products) {
      const existing = await repo.findOne({ where: { slug: data.slug } });
      if (existing) continue;
      await repo.save(repo.create(data));
    }
  }
}
```

### First-time startup sequence

```bash
# 1. Start infrastructure (Postgres + Redis)
docker compose -f docker-compose.dev.yml up -d

# 2. Build shared package (entities must be compiled before migration CLI uses them)
yarn workspace @repo/api build

# 3. Create all tables
yarn workspace api migration:run

# 4. Populate seed data
yarn workspace api seed:run

# 5. Start the dev server
yarn dev
```
