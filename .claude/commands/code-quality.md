---
description: Run code quality checks across the monorepo or a specific workspace
allowed-tools: Read, Glob, Grep, Bash(yarn:*), Bash(npx:*)
---

# Code Quality Review

Run quality checks on: $ARGUMENTS (defaults to all workspaces)

## Instructions

1. **Run automated checks**:
   ```bash
   # Lint all workspaces
   yarn lint

   # Type check
   yarn workspace api check-types
   yarn workspace web check-types

   # Tests
   yarn test
   ```

2. **Manual checklist** for TypeScript files found in `$ARGUMENTS`:
   - [ ] No `any` types — use `unknown`
   - [ ] No silent error swallowing
   - [ ] DTOs have `class-validator` decorators
   - [ ] Entities extend `BaseEntity` or `BaseEntityWithoutSoftDelete`
   - [ ] No direct `process.env` — use `ConfigService`
   - [ ] Paginated queries use `PageOptionsDto`
   - [ ] New entities added to `data-source.ts`
   - [ ] New modules registered in `modules/index.ts`

3. **Report findings** by severity:
   - **Critical** (must fix): type errors, missing validators, security issues
   - **Warning** (should fix): conventions, missing pagination, pattern violations
   - **Suggestion** (could improve): naming, optimization
