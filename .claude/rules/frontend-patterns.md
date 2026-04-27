# Frontend Patterns (Next.js + shadcn/ui)

## Component Model

- **Server Components by default** — no `'use client'` unless the component uses:
  - Event handlers (`onClick`, `onChange`, etc.)
  - React hooks (`useState`, `useEffect`, `useContext`, etc.)
  - Browser-only APIs (`window`, `localStorage`, etc.)
- Keep `'use client'` components as leaf nodes — push them down the tree as far as possible
- Never import server-only code (TypeORM, NestJS, etc.) into client components

## Importing from `@repo/api` in `apps/web`

**Always use `@repo/api/fe`, never `@repo/api` directly.**

`@repo/api` (the full barrel) includes NestJS DTO classes decorated with `@IsInt()`, `@Type()`, `PartialType()`, etc. These decorators use `reflect-metadata` and `class-transformer/storage` at class-definition time — both are Node.js-only and crash the browser.

`@repo/api/fe` solves this with two rules:
1. **Enums** are `export *` (value exports) — safe because enums have no decorators.
2. **All DTOs** are `export type` — TypeScript erases these entirely before bundling; zero decorator code reaches the browser.

```ts
// ✅ Correct — all web imports use @repo/api/fe
import { ProductStatus } from '@repo/api/fe';               // enum value — safe
import type { ProductResponseDto } from '@repo/api/fe';     // type-only — erased
import type { UpdateProductDto } from '@repo/api/fe';       // type-only — erased (PartialType never runs)

// ❌ Wrong — @repo/api barrel loads decorator code into the browser
import { ProductStatus } from '@repo/api';                  // runs PageOptionsDto decorators → Reflect crash
import type { UpdateProductDto } from '@repo/api';          // technically safe (type-only), but misleading
```

**Why `import type` matters for DTOs:**
- `import { PageOptionsDto } from '@repo/api/fe'` — even though `fe-entry.ts` re-exports it as `export type`, a value-style import on the consumer side would still cause bundlers to evaluate the module.
- `import type { PageOptionsDto } from '@repo/api/fe'` — TypeScript guarantees erasure; the module is never evaluated.
- Always use `import type` for DTO shapes in `apps/web` since you never instantiate them at runtime (Zod handles form validation).

**What belongs in each entry point:**

| What | Entry point | Import style |
|------|------------|--------------|
| Enums (`ProductStatus`, `UserRole`, …) | `@repo/api/fe` | `import { … }` (value) |
| Response/Query/Create/Update DTO shapes | `@repo/api/fe` | `import type { … }` |
| Entities, BE-only decorators, TypeORM | `@repo/api` | BE only — never in `apps/web` |

## File & Folder Structure (apps/web)

```
app/
├── (auth)/              # Route group — shared layout for auth pages
│   ├── login/
│   └── register/
├── (dashboard)/         # Route group — shared layout for dashboard
│   ├── layout.tsx       # Dashboard shell (sidebar, header)
│   └── <feature>/
│       ├── page.tsx     # Server component — fetch data here
│       └── <feature>-client.tsx  # Client component — interactivity
├── api/                 # Route handlers (Next.js API routes)
│   └── <route>/
│       └── route.ts
└── layout.tsx           # Root layout
components/              # App-specific composite components (NOT from @repo/ui)
constants/               # App-specific constants only
│   ├── api-paths.ts     # API_PATHS — all endpoint strings
│   └── routes.ts        # ROUTES — typed route paths
hooks/                   # Resource-level TanStack Query hooks (use-products.ts, etc.)
lib/                     # axios instance, query-client, auth-store, extract-api-error
services/                # One file per API resource (products.service.ts, etc.)
types/                   # api.types.ts — ApiResponse<T>, PageResult<T>
```

**No local wrapper re-export files.** If a hook, constant, or util is already in `@repo/ui` or `@repo/api`, import from there directly — do not create a thin re-export in `apps/web/`.

## Data Fetching

- Fetch data in Server Components using `async/await` directly — no `useEffect` for initial data
- Use `fetch()` with `cache` / `revalidate` options for server-side caching
- Pass fetched data as props to Client Components — never fetch in Client Components unless for mutations
- Use `loading.tsx` and `error.tsx` conventions for streaming and error boundaries

```tsx
// Correct — Server Component
export default async function ProductsPage() {
  const products = await fetchProducts(); // runs on server
  return <ProductList products={products} />;
}

// Wrong — Client Component fetching on mount
'use client';
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => { fetchProducts().then(setProducts); }, []);
}
```

## UI Components

- Import all shadcn primitives from `@repo/ui/components/ui/<name>` — never copy locally
- Import `cn` from `@repo/ui/lib/utils` for conditional class merging
- Import `useMobile` from `@repo/ui/hooks/use-mobile` for responsive logic
- Shared utility hooks live in `@repo/ui/hooks/` — import from there, never redefine locally:
  - `useDebounce<T>(value, delay?)` — debounce any value; ideal for search inputs
  - `useWindowSize()` — `{ width, height }`, both `undefined` during SSR
  - `useBreakpoint()` — current Tailwind breakpoint (`'sm' | 'md' | 'lg' | 'xl' | '2xl'`)
  - `useIsMinBreakpoint(bp)` — returns `true` when viewport ≥ given breakpoint
  - `useIsMobile()` — shorthand for `width < 768px`
  - `useScreenSize()` — `{ width, height, breakpoint, isMobile, isTablet, isDesktop, isLargeDesktop }`

## Forms

- Use `useAppForm(schema, options?)` from `@repo/ui/hooks/use-app-form` for all forms — pre-wires `zodResolver` and `mode: 'onTouched'` (validates on blur, re-validates on change)
- Define the Zod schema in the same file as the form component (unless shared across multiple forms)
- Always use shadcn `<Form>`, `<FormField>`, `<FormItem>`, `<FormMessage>` for layout and error display
- Use `VALIDATION_MESSAGES` and `PATTERNS` from `@repo/ui/constants/validation` in Zod schemas for consistent error wording
- App-specific composite components go in `apps/web/components/` (not packages/ui)
- Use Tailwind classes exclusively — no inline `style={{}}` except for truly dynamic values (CSS variables, calculated widths)

```tsx
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent } from '@repo/ui/components/ui/card';
import { cn } from '@repo/ui/lib/utils';
```

## HTTP Client (Axios)

- Single axios instance in `apps/web/lib/axios.ts` — never create new instances in components
- Request interceptor injects `Authorization: Bearer <token>` from cookie automatically
- Response interceptor handles 401 → clears token → redirects to `/login`
- Base URL from `NEXT_PUBLIC_API_URL` env var (default: `http://localhost:5000`)
- All API responses typed as `ApiResponse<T>` from `apps/web/types/api.types.ts`

## Services

- One file per resource in `apps/web/services/<resource>.service.ts`
- Use path constants from `@/constants/api-paths` — never hardcode URL strings
- Types imported from `@repo/api/fe` (enums as values, DTOs as `import type`)
- Services unwrap `data.data` — callers receive the typed payload directly

```ts
import { API_PATHS } from '@/constants/api-paths';
import type { ProductResponseDto, QueryProductDto } from '@repo/api/fe';

export const productsService = {
  async getList(params?: QueryProductDto): Promise<PageResult<ProductResponseDto>> {
    const { data } = await api.get(API_PATHS.PRODUCTS.ROOT, { params });
    return { data: data.data, meta: data.meta! };
  },
};
```

## Error Handling

- `extractApiError(err)` in `apps/web/lib/extract-api-error.ts` maps API error codes to messages automatically
- API returns `{ message: "PRD_001" }` → `extractApiError` looks up `ERROR_MESSAGES["PRD_001"]` → `"Product not found."`
- `ERROR_MESSAGES` is imported from `@repo/api/fe` — single source of truth in `packages/api/src/errors.ts`
- Unknown codes fall through to the raw string; non-code messages (class-validator arrays) are joined with `; `

```ts
onError: (err) => toast.error(extractApiError(err))
```

## Constants

Always use constants — never magic strings or numbers in components.

App-specific constants (`apps/web/constants/`):
```ts
import { ROUTES } from '@/constants/routes';           // ROUTES.PRODUCTS, ROUTES.LOGIN
import { API_PATHS } from '@/constants/api-paths';     // API_PATHS.PRODUCTS.BY_ID(id)
```

Shared constants from `@repo/ui` (do not duplicate locally):
```ts
import { PAGINATION } from '@repo/ui/constants/pagination';       // PAGINATION.DEFAULT_PAGE_SIZE
import { TIME_MS, TIME_S } from '@repo/ui/constants/time';        // TIME_MS.DEBOUNCE_SEARCH
import { VALIDATION_MESSAGES, PATTERNS, NUMERIC, LENGTH } from '@repo/ui/constants/validation';
```

## Utils

Shared format utilities from `@repo/ui` (do not duplicate locally):
```ts
import { formatPrice, formatNumber, formatCompact, formatDate, truncateMiddle } from '@repo/ui/utils/format';
// formatPrice(1299.99)  → "$1,299.99"
// formatCompact(1500000) → "1.5M"
// formatDate('2026-04-27') → "27/04/2026"
```

## TanStack Query Hooks

- One file per resource in `apps/web/hooks/use-<resource>.ts`
- Define `QUERY_KEYS` object at top of each hook file for cache invalidation
- `useQuery` for reads, `useMutation` for writes
- Invalidate related queries in `onSuccess` of mutations
- Show toast errors via `extractApiError` in `onError`

```ts
// apps/web/hooks/use-products.ts
export const PRODUCT_KEYS = {
  list: (params?: PageOptionsDto) => ['products', params] as const,
  detail: (id: number) => ['products', id] as const,
};

export function useProducts(params?: PageOptionsDto) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => productsService.getList(params),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    onError: (err) => toast.error(extractApiError(err)),
  });
}
```

## Auth State (Zustand)

- Auth store in `apps/web/lib/auth-store.ts` — persisted to localStorage via `persist` middleware
- Token stored in both cookie (for axios interceptor) and Zustand (for UI state)
- Use `useAuthStore()` to read `user`, `isAuthenticated`; call `setAuth` / `clearAuth`
- Never read token directly in components — let the axios interceptor handle it

## State Management

- **Server state** (API data): TanStack Query — never duplicate into Zustand
- **Auth state**: Zustand with persist (`useAuthStore`)
- **URL state**: search params for filters, pagination, active tab — shareable and back-button friendly
- **Local UI state**: `useState` for modals, toggles, form open/closed
- **Global UI state**: React Context only (theme, sidebar collapsed)

## Routing & Navigation

- Use `<Link>` from `next/link` for all internal navigation — never `<a>` tags
- Use `useRouter().push()` for programmatic navigation after mutations
- Use route groups `(group)/` to share layouts without affecting URL structure
- Dynamic segments: `[id]` for single, `[...slug]` for catch-all, `((.))` for parallel routes

## Performance

- Use `next/image` for all images — never raw `<img>` tags
- Use `next/font` for fonts — already set up in `layout.tsx` with Geist/Geist_Mono
- Use `React.lazy` + `Suspense` for heavy client components below the fold
- Avoid large client-side bundles: keep `'use client'` components small and focused

## Tailwind Conventions

- Design tokens come from `@repo/ui/globals.css` CSS variables — use semantic names (`bg-background`, `text-foreground`, `border-border`) not raw colors
- Dark mode via `.dark` class — already configured in the shared globals
- Responsive: mobile-first (`sm:`, `md:`, `lg:`, `xl:`)
- Spacing scale: prefer `4` (1rem) as base unit; use `2`, `4`, `6`, `8`, `12`, `16` multiples
