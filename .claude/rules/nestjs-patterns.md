# NestJS Patterns

## Module Structure

DTOs live in `packages/@repo/api` so the FE can import the same types for API calls.
Module code lives in `apps/api/src/modules/<feature>/`.

**`packages/@repo/api/src/dtos/<feature>/`** — all DTO definitions:
```
<feature>/
├── create-<feature>.dto.ts    – request body for POST
├── update-<feature>.dto.ts    – request body for PATCH (extends PartialType)
├── query-<feature>.dto.ts    – query params for list endpoints (extends PageOptionsDto)
└── <feature>-response.dto.ts  – response shape returned to clients
```

**`apps/api/src/modules/<feature>/`** — NestJS module wiring only:
```
<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts    – imports DTOs from @repo/api
├── <feature>.service.ts
└── <feature>.repository.ts    (if custom queries needed)
```
Register the module in `apps/api/src/modules/index.ts` — never import it directly into `AppModule`.

**DTO rules:**
- `class-validator` and `class-transformer` decorators → allowed in `packages/@repo/api`
- `@nestjs/swagger` `@ApiProperty` decorators → `apps/api` only (never in `@repo/api`)
- Every DTO added to `packages/@repo/api` must be re-exported from `src/entry.ts`
- Import DTOs in controllers/services via `@repo/api`: `import { CreateProductDto } from '@repo/api'`

## New Feature Checklist

Follow this order exactly when adding a new resource (e.g. `order`):

### 1. Shared package (`packages/@repo/api`)

- [ ] Add any new enum values to `src/constants/enums.ts`
- [ ] Create entity in `src/entities/<feature>.entity.ts` extending the appropriate base class
- [ ] Create DTOs in `src/dtos/<feature>/`: create, update, query, response (with mapper function `toXxxDto`)
- [ ] Re-export everything from `src/entry.ts`
- [ ] Run `yarn workspace @repo/api build` to compile

### 2. Backend (`apps/api`)

- [ ] Register entity in `src/data-source.ts` → `entities` array
- [ ] Add new error codes to `packages/api/src/errors.ts` (`ErrorCodes` + `ERROR_MESSAGES`) and rebuild `@repo/api`
- [ ] Write a manual migration in `src/database/migrations/<timestamp>-<name>.ts`
- [ ] Create module folder `src/modules/<feature>/` with `.module.ts`, `.controller.ts`, `.service.ts`
- [ ] Register the module in `src/modules/index.ts`
- [ ] Run `yarn workspace api migration:run` to apply the migration

### 3. Frontend (`apps/web`)

- [ ] Create service in `services/<feature>.service.ts` (axios calls, unwrap `data.data`)
- [ ] Create hooks in `hooks/use-<feature>.ts` (TanStack Query, define `QUERY_KEYS`)
- [ ] Create page at `app/<feature>/page.tsx` (Server Component shell)
- [ ] Create `app/<feature>/<feature>-client.tsx` for interactive table/form (`'use client'`)

### Auth on endpoints

- Public (no login required): add `@Public()` to the controller method or the whole controller
- Admin-only mutations: add `@Roles(UserRole.ADMIN)` to the relevant methods
- Default (JWT required): no decorator needed — `JwtAuthGuard` is global

Storefront GET endpoints (list, detail) are typically `@Public()`. Mutation endpoints (create, update, delete) typically require `@Roles(UserRole.ADMIN)`.

## Controllers

- One controller per feature; never put business logic in controllers
- Always tag with `@ApiTags('<name>')` matching the tag registered in `swagger.ts`
- Use `@ApiBearerAuth()` on protected controllers
- Use `@Public()` only on auth endpoints (login, register, refresh)
- Use `@CurrentUser()` to extract the JWT payload — never read `req.user` directly
- Use `@Roles(UserRole.ADMIN)` + RolesGuard for role-restricted endpoints
- Always type the return of controller methods; use `PageDto<T>` for paginated lists

```ts
// Correct
@Get()
async findAll(@Query() query: PageOptionsDto): Promise<PageDto<UserDto>> {
  return this.userService.findAll(query);
}

// Wrong — no return type, business logic in controller
@Get()
async findAll(@Query() query: any) {
  const users = await this.repo.find();
  return { data: users };
}
```

## Services

- Services own all business logic; keep them framework-agnostic where possible
- Throw NestJS HTTP exceptions directly — let the global exception filter handle the response
- Import `ErrorCodes` from `@repo/api` — never from a local file. `apps/api/src/constants/error-codes.ts` no longer exists.
- Never return raw TypeORM entities from services that reach the controller — map to DTOs first

```ts
// Correct
throw new NotFoundException(ErrorCodes.USER_NOT_FOUND);

// Wrong — magic strings
throw new NotFoundException('User not found');
```

## Response Shape

All responses are wrapped by `TransformResponseInterceptor` into:
```json
{ "success": true, "message": "success", "data": <T>, "meta": <PageMetaDto|undefined> }
```
- Return `{ data, meta }` from services for paginated results — the interceptor unpacks it
- Return plain objects/entities for single-resource results — the interceptor wraps them
- Never manually construct `{ success, message, data }` in controllers or services

## Pagination

Use `PageOptionsDto` / `PageDto` / `PageMetaDto` from `@repo/api` for all list endpoints:
```ts
// Service
async findAll(options: PageOptionsDto): Promise<PageDto<ProductDto>> {
  const [items, total] = await this.repo.findAndCount({
    skip: options.skip,
    take: options.limit,
    order: { [options.orderBy]: options.direction },
  });
  const meta = new PageMetaDto({ pageOptions: options, itemCount: total });
  return new PageDto(items.map(toDto), meta);
}
```

## Repositories

- Extend `BaseRepository<T>` for custom query methods
- Use `findOneByIdOrFail` instead of `findOne` when the entity must exist (throws 404 automatically)
- Use `findBatch(fromId, count)` for cursor-based pagination over large datasets
- Inject via `@InjectRepository(Entity)` + `getRepositoryToken(Entity)` in module providers

## Caching with Redis

Use `RedisService.remember()` for cache-aside pattern — it deduplicates concurrent requests:
```ts
return this.redisService.remember(
  `product:${id}`,
  () => this.productRepo.findOneByIdOrFail(id),
  '10m',
);
```
TTL format: `5s`, `10m`, `1h`, `7d` — never raw seconds unless it's a variable.
Invalidate on mutation: `this.redisService.clearByPattern('product:*')`.

## Enums

All enums live in `packages/@repo/api/src/constants/enums.ts` — import from `@repo/api`.
Never define duplicate enums in `apps/api`. Add new enums to the shared file.

## Error Handling

- `NotFoundException` — entity not found by ID
- `BadRequestException` — invalid input that passed DTO validation but fails business rules
- `UnauthorizedException` — missing/invalid token (guard handles this automatically)
- `ForbiddenException` — authenticated but insufficient permissions
- `ConflictException` — duplicate entry (email taken, etc.)
- Always pass an `ErrorCodes.*` constant as the message argument

## Background Jobs (BullMQ)

- Define queue name as a constant, never an inline string
- Processor class decorated with `@Processor(QUEUE_NAME)`
- Register queue in `BullQueueModule` or the feature module — not in `AppModule`
- Use `@Public()` equivalent: jobs are not HTTP so guards don't apply, but validate job data with class-validator manually

## Swagger

- All request DTOs: `@ApiProperty()` on every field
- All response DTOs: `@ApiProperty()` on every field
- Controllers: `@ApiTags()`, `@ApiBearerAuth()`, `@ApiOperation({ summary: '...' })`
- Swagger only enabled in non-production (`NODE_ENV !== 'production'`)
