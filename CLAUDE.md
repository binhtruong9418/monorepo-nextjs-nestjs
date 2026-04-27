# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Turborepo monorepo using Yarn workspaces. Two apps (NestJS API + Next.js web), four shared packages (UI components, shared API DTOs/entities, and config packages for ESLint, Jest, TypeScript).

## Commands

### Root (runs across all workspaces via Turbo)
```bash
yarn dev          # Start all apps in watch/dev mode (parallel, persistent)
yarn build        # Build all packages and apps (respects dependency order)
yarn lint         # Lint all workspaces
yarn test         # Run all unit tests
yarn test:e2e     # Run all e2e tests
yarn format       # Prettier format .ts/.tsx/.md files
```

### Per-app commands
```bash
# Run a single workspace's script:
yarn workspace api dev
yarn workspace web dev
yarn workspace @repo/ui check-types
```

### Apps individually
```bash
# apps/api (NestJS, port 3000)
cd apps/api && yarn dev          # watch mode
cd apps/api && yarn test         # unit tests (Jest)
cd apps/api && yarn test:e2e     # e2e tests

# apps/web (Next.js + Turbopack, port 3001)
cd apps/web && yarn dev          # Turbopack dev server
cd apps/web && yarn check-types  # tsc --noEmit
```

## Architecture

### Workspace Layout
```
apps/api       – NestJS REST API (port 3000)
apps/web       – Next.js 16 App Router frontend (port 3001)
packages/@repo/api               – Shared DTOs and entities consumed by both apps
packages/@repo/ui                – React component library consumed by apps/web
packages/@repo/eslint-config     – ESLint + Prettier flat configs for all workspaces
packages/@repo/typescript-config – Base tsconfig files (nestjs.json, nextjs.json, react-library.json)
packages/@repo/jest-config       – Jest configs (nest, next variants)
```

### Package Dependency Flow
- `apps/api` ← `@repo/api` (DTOs, entities)
- `apps/web` ← `@repo/ui` (components), `@repo/api` (shared types)
- All workspaces ← `@repo/eslint-config`, `@repo/typescript-config`, `@repo/jest-config`

### Shared Config Usage
Each app extends from the shared packages rather than defining its own config:
- `eslint.config.mjs` imports from `@repo/eslint-config/nest-js` or `/next-js`
- `tsconfig.json` extends `@repo/typescript-config/nestjs.json` or `/nextjs.json`
- `jest.config.ts` imports `nestConfig` or `nextConfig` from `@repo/jest-config`

### `@repo/api` Package
- Source lives in `src/`, compiled output in `dist/`
- Must be built before `apps/api` can run (`turbo build` handles this)
- Add new shared DTOs/entities here; import them in both apps as needed

### `@repo/ui` Package
- Exports source `.tsx` files directly (no build step needed for dev)
- Components live in `packages/ui/src/`; generate new ones with `yarn workspace @repo/ui generate:component`

### `apps/api` Backend Structure
```
src/
├── configs/          – ConfigModule, DatabaseModule, env validation
├── constants/        – error-codes.ts (backend-only)
├── data-source.ts    – TypeORM DataSource (CLI + runtime); add new entities here
├── database/
│   ├── entities/     – local-only entities (most entities live in @repo/api)
│   ├── migrations/   – generated via `yarn workspace api migration:generate`
│   ├── repositories/ – BaseRepository + custom repos
│   └── seeds/        – seed runner via `yarn workspace api seed:run`
├── modules/
│   └── index.ts      – register all feature modules here
└── shared/
    ├── common/       – BaseIntervalWorker
    ├── decorators/   – @Public(), @CurrentUser(), @Roles()
    ├── guards/       – JwtAuthGuard (global), RolesGuard, ApiKeyGuard
    ├── interceptors/ – TransformResponseInterceptor (global)
    ├── middlewares/  – LoggerMiddleware (global)
    └── modules/      – RedisModule, BullQueueModule, SharedModule
```

### `packages/@repo/api` Shared Package
```
src/
├── common/     – BaseEntity, BaseEntityWithoutSoftDelete, BaseIdEntity
├── constants/  – enums.ts (UserRole, OrderStatus, PaymentStatus, …)
├── dtos/
│   ├── page-option.dto.ts, page-meta.dto.ts, page.dto.ts  – pagination
│   └── <feature>/
│       ├── create-<feature>.dto.ts    – POST request body
│       ├── update-<feature>.dto.ts    – PATCH request body
│       ├── query-<feature>.dto.ts     – query params (pagination, sort, filters)
│       └── <feature>-response.dto.ts  – response shape
├── entities/   – UserEntity and all TypeORM entities (shared with both apps)
└── entry.ts    – re-exports everything
```

**Rules:**
- All feature DTOs (request, response, filter) → `packages/@repo/api/src/dtos/<feature>/`
- Entities → `packages/@repo/api/src/entities/`
- `class-validator` / `class-transformer` decorators → allowed in `packages/@repo/api`
- `@nestjs/swagger` `@ApiProperty` decorators → `apps/api` only (never in `@repo/api`)
- Every new DTO/entity must be re-exported from `packages/@repo/api/src/entry.ts`
- Every new **enum or DTO** must also be re-exported from `packages/@repo/api/src/fe-entry.ts` (enums as `export *`, DTOs as `export type`)
- New entities must also be added to `apps/api/src/data-source.ts`
- Always run `yarn build` on `@repo/api` before running migrations

**Two entry points:**
- `@repo/api` — full barrel for `apps/api` (NestJS). Includes entities, decorators, PartialType DTOs.
- `@repo/api/fe` — browser-safe barrel for `apps/web`. Enums + `ErrorCodes` + `ERROR_MESSAGES` as values; all DTOs as `export type` (erased at compile time, no decorator code in browser). See `frontend-patterns.md` for import rules.

**Error codes (`packages/api/src/errors.ts`):**
- Single source of truth for error codes (`ErrorCodes`) and their human-readable messages (`ERROR_MESSAGES`).
- `apps/api/src/constants/error-codes.ts` re-exports from `@repo/api` — do not define codes there.
- API throws `new NotFoundException(ErrorCodes.PRODUCT_NOT_FOUND)` — the code string is the exception message.
- FE `extractApiError` maps the code to a message via `ERROR_MESSAGES` automatically.
- When adding a new error: add the code to `ErrorCodes` and its message to `ERROR_MESSAGES` in `packages/api/src/errors.ts`, then rebuild `@repo/api`.

### Migration Workflow

Migrations are written **manually** (QueryRunner API) — auto-generate is unreliable when entities live in `@repo/api`. See `.claude/rules/database-patterns.md` for the full migration template and naming conventions.

```bash
# Build shared entities first (always required before migration commands)
yarn workspace @repo/api build

yarn workspace api migration:show     # list pending
yarn workspace api migration:run      # apply pending
yarn workspace api migration:revert   # undo last
yarn workspace api migration:generate src/database/migrations/<name>  # diff preview only
```

### First-time local setup

```bash
# Start Postgres + Redis
docker compose -f docker-compose.dev.yml up -d

# Build shared package
yarn workspace @repo/api build

# Create DB tables
yarn workspace api migration:run

# Seed data
yarn workspace api seed:run

# Start all services
yarn dev
```

## Rules

Project-level rules live in `.claude/rules/` and apply to all work in this repo:
- **`code-style.md`** — TypeScript conventions, naming, comment policy
- **`security.md`** — auth/authorization, input validation, secrets, database safety
- **`nestjs-patterns.md`** — module structure, controllers, services, response shape, pagination, caching, error codes, Swagger
- **`frontend-patterns.md`** — Server vs Client Components, data fetching, forms, API calls, state, Tailwind conventions
- **`database-patterns.md`** — entity rules, migrations, repositories, soft-delete, relations, transactions

## Agents & Commands

### Agents (autonomous subagents)
- **`code-reviewer`** — proactive code review after any change; NestJS/Next.js conventions

### Slash Commands
- **`/code-quality [path]`** — run lint + typecheck + manual checklist

## Key Conventions

- **TypeScript strict mode** everywhere; `strictNullChecks: true` in all tsconfigs
- **Flat ESLint config** (ESLint 9+) across all workspaces — use `eslint.config.mjs`
- **NestJS apps** use CommonJS (`nestjs.json` tsconfig); **Next.js/UI packages** use ESM
- Prettier single-quote style enforced via `@repo/eslint-config/prettier-base`
- Turbo caches `dist/**` and `.next/**`; `dev` tasks are non-cached and persistent
- **No `synchronize: true`** in TypeORM — always use migrations
