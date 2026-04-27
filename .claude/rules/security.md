# Security Rules

## Authentication & Authorization

- All API routes are JWT-protected by default via global `JwtAuthGuard`
- Use `@Public()` explicitly for unauthenticated endpoints — never disable the guard globally
- Use `@Roles()` + `RolesGuard` for role-based access; never check roles manually in controllers
- Never expose `passwordHash` or any credential field in API responses
- JWT secrets must come from `ConfigService` — never hardcode or read from `process.env` directly

## Input Validation

- All controller inputs (body, query, param) must use a DTO with `class-validator` decorators
- `ValidationPipe` is global with `whitelist: true` — unknown fields are stripped automatically
- Validate and sanitize file uploads: check MIME type, size limit, extension whitelist
- Never pass raw user input to TypeORM queries — always use parameterized queries or QueryBuilder

## Environment Variables

- All secrets in `.env` — never commit `.env` files
- Validate all env vars at startup via `env.validation.ts` (class-validator `EnvironmentVariables`)
- Prefix public Next.js env vars with `NEXT_PUBLIC_` only when they are truly safe to expose

## API Security

- `helmet()` is applied globally in `main.ts` — do not remove it
- CORS is configured in `main.ts` from `CORS_ORIGINS` env var — never use `origin: '*'` in production
- Rate limiting via `ThrottlerGuard` is global — tighten limits on auth endpoints
- Use `X-API-Key` header + `ApiKeyGuard` for internal service-to-service calls

## Database

- Never use `synchronize: true` in TypeORM — always use migrations
- Never log full SQL queries containing user data in production
- Soft-delete with `BaseEntity` (has `deletedAt`) — prefer over hard deletes for audit trails

## Secrets & Credentials

- Never log passwords, tokens, API keys, or PII
- `LoggerMiddleware` already masks sensitive fields — extend its `SENSITIVE_FIELDS` list if needed
- Never store plain-text passwords — always hash with bcrypt before persisting

## Dependencies

- No unvetted packages for auth, crypto, or payment flows
- Keep `@nestjs/*`, `typeorm`, and security-related packages up to date
