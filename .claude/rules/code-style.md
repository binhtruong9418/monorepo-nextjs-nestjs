# Code Style Rules

## TypeScript

- Strict mode everywhere — `strictNullChecks: true`, no `any` unless unavoidable
- Prefer `type` over `interface` for object shapes; use `interface` only for extendable contracts
- Always explicit return types on exported functions
- No barrel `index.ts` re-exports unless the folder has 3+ exports
- Use `const` by default; `let` only when reassignment is needed

## Naming

- Files: `kebab-case` for all TS/JS/CSS (e.g. `user-service.ts`, `use-mobile.ts`)
- Classes/Types/Enums: `PascalCase`
- Variables/functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE` only for true compile-time constants
- Boolean variables: prefix with `is`, `has`, `can`, `should` (e.g. `isLoading`, `hasError`)

## NestJS (apps/api)

- One module per feature folder under `src/modules/`
- DTOs with `@nestjs/swagger` decorators stay in `apps/api` — never in `packages/@repo/api`
- Shared DTOs/entities (used by FE too) go in `packages/@repo/api/src/`
- Inject services via constructor, never use property injection
- Use `@Public()` decorator for unauthenticated endpoints; all others require JWT by default
- Response shape always via `TransformResponseInterceptor` — never return raw objects in controllers
- Validation: `class-validator` + `ValidationPipe` (whitelist: true, transform: true)

## Next.js (apps/web)

- App Router only — no Pages Router
- Server Components by default; add `'use client'` only when needed (event handlers, hooks, browser APIs)
- Import UI components from `@repo/ui/components/ui/<name>` — never copy components locally
- Import `cn` from `@repo/ui/lib/utils`
- Tailwind classes only — no inline `style={{}}` unless dynamic values that can't be expressed in Tailwind
- **No local wrapper re-export files** — if a hook/constant already exists in `@repo/ui` or `@repo/api`, import from there directly; do not create a thin `apps/web/hooks/use-xyz.ts` that only re-exports it

## packages/@repo/ui

- All shadcn components live in `src/components/ui/`
- Add new components via `yarn dlx shadcn@latest add <name>` from `apps/web/`
- Never manually edit generated shadcn component internals
- Custom shared components go in `src/components/` (not `src/components/ui/`)

## Comments

- No comments explaining WHAT the code does — names should do that
- Comments only for WHY: hidden constraints, workarounds, non-obvious invariants
- No multi-line comment blocks; one short line max

## Formatting

- Prettier enforced on save (hook auto-runs on `.ts`/`.tsx` edits)
- Single quotes, no semicolons in configs — follow existing file style
- Max line length: 100 characters
