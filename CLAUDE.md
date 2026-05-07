# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (port 8080 by default, auto-picks another if busy)
- `npm run build` — TypeScript check (`tsc`) then `vite build`. Both must pass
- `npm run preview` — serve the production build locally
- `npm run lint` — ESLint on `.ts`/`.tsx` with `--max-warnings 0` (zero-warning policy)
- `npm run add-brands` / `npm run add-skus` — one-off data seeding scripts run via `ts-node` with `tsconfig.scripts.json` (these hit Supabase directly, so they need `.env` populated)

There is no test runner configured in this repo.

## Architecture

Single-page React 18 + TypeScript app built with Vite, using Supabase as the sole backend (Postgres + Auth + Storage). Deployed on Vercel; also has Replit config.

**Path alias:** `@/*` → `src/*` (configured in `vite.config.ts` and `tsconfig.*.json`).

### Routing and lazy-loading (`src/App.tsx`)
All routes live in a single `<Routes>` block. Heavy routes — `/admin`, `/admin/orders/:orderId`, `/discovery-set/:id` — are `lazy()`-imported and wrapped in `<Suspense>` with a `PageLoader`. The catch-all `<Route path="*" element={<NotFound />}>` must stay last; custom routes go above it. `<ScrollToTop />` resets scroll on pathname change.

### Auth + admin gating
Auth is Supabase-native (`src/contexts/AuthContext.tsx`). On session change, `checkAdminStatus` queries the `admin_users` table filtered by `user_id`; result populates `isAdmin` on the context. `<ProtectedRoute>` (`src/components/ProtectedRoute.tsx`) gates admin routes based on this flag.

**Security model is defense-in-depth**: `ProtectedRoute` (UI) + `Admin.tsx` checks + Supabase RLS policies (`supabase/migrations/001_admin_security.sql`). The RLS layer is authoritative — the frontend checks are UX, not security. An `is_admin()` SQL function wraps the membership check and is referenced in RLS policies across `products`, `orders`, storage, etc.

**Do not reintroduce the service role key into the frontend.** `SECURITY_SETUP.md` documents the deliberate removal; `VITE_SUPABASE_SERVICE_ROLE_KEY` must not appear in `.env` or Vercel env vars. All privileged operations must go through RLS + `is_admin()`.

### Data layer
- Supabase client: `src/integrations/supabase/client.ts` — singleton, typed against generated `Database` type in `src/integrations/supabase/types.ts`. Reduced realtime rate (2 events/sec) to limit overhead.
- Data fetching: TanStack React Query hooks in `src/hooks/` (`useProducts`, `useOrders`, `useSKUs`, `useDiscoverySets`, `useCart`). Components consume these hooks, not the Supabase client directly.
- Forms: React Hook Form + Zod schemas.

### Migrations
`supabase/migrations/` holds raw SQL applied manually via the Supabase SQL Editor (per `SECURITY_SETUP.md`) — there is no automated migration runner wired in. When adding a migration, keep the numeric prefix sequence and assume it will be pasted into the dashboard. Storage bucket policies (`product-images`, `brand-images`, `discovery-sets-images`) are configured through the dashboard UI, not migrations.

### Feature areas
- `src/components/discovery/` — discovery-set builder (user-facing config flow: slot manager, product selector, recommendations). `DiscoverySetBuilder` is the top-level orchestrator.
- `src/components/admin/` — admin forms for products, SKUs, discovery sets, brand images, orders. Uploads go through `src/utils/storage-upload.ts` / `storage.ts`.
- `src/pages/` — route-level components; each route in `App.tsx` maps to one of these.

### Conventions
- UI copy is in Romanian (see placeholder strings in `App.tsx`, `SECURITY_SETUP.md`). Keep new user-facing strings consistent with this.
- Styling: Tailwind + shadcn-style wrappers over Radix primitives in `src/components/ui/`. Variants via `class-variance-authority`; class merging via `tailwind-merge` (exposed as `cn()` in `src/lib/utils.ts`).
- Images: WebP preferred; `assetsInclude` in `vite.config.ts` covers `.webp` and `.avif`. Inline threshold is 4KB.
- Environment variables must be prefixed `VITE_` to be exposed to client code. Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` throws at client construction.
