# SEO Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make modestshop.md crawlable, share-rich, and slug-routed across all 3 supported languages — without coupling to any specific host (current Vercel prototype, future self-hosted).

**Architecture:** Five pillars — slug-routed URLs, pre-rendered static HTML per route via `vite-react-ssg`, build-time `sitemap.xml` from Supabase, JSON-LD per page type, and meta/image polish. All output is portable static `dist/`, no runtime SSR.

**Tech Stack:** Vite, React 18, React Router (replaced by `vite-react-ssg`'s router), Supabase (read-only at build), `react-helmet-async` (already used).

**Phase order:** Phases stand alone — each ships value independently and unblocks the next.

1. **Phase 1 — Slug routing** (foundation; URLs need to be stable before pre-rendering bakes them in)
2. **Phase 2 — Brand pages** (new route added with the slug system)
3. **Phase 3 — Pre-rendering** (turns the SPA into static HTML)
4. **Phase 4 — Sitemap + robots.txt** (tells Google what to crawl)
5. **Phase 5 — JSON-LD structured data**
6. **Phase 6 — Meta + image + perf polish**

**File Structure**

Files **created**:
- `src/utils/slugs.ts` — pure slug helpers and lookup functions
- `src/pages/Brand.tsx` — brand category page
- `src/utils/jsonLd.ts` — Schema.org payload builders
- `scripts/generate-sitemap.ts` — build-time sitemap generator
- `src/lib/routes.ts` — central route table consumed by App.tsx and the SSG build

Files **modified**:
- `src/App.tsx` — switch to data-route config; legacy UUID routes redirect to slugs
- `src/components/ProductCard.tsx`, `ProductListCard.tsx`, `SearchOverlay.tsx` — link via `productPath()`
- `src/components/BrandWall.tsx`, `src/components/shop/BrandsView.tsx` — link to `/brand/:slug`
- `src/pages/Product.tsx`, `src/pages/DiscoverySetProduct.tsx` — slug-based lookup with UUID-redirect fallback
- `src/hooks/usePageMeta.tsx` — emit hreflang URLs that match slug routes
- `index.html` — meta polish (theme-color, app-name, hero `fetchpriority=high`)
- `vite.config.ts` — `vite-react-ssg` integration + sitemap script wiring
- `src/main.tsx` — entry split for SSG vs CSR if needed
- `package.json` — add `vite-react-ssg`; new scripts
- `public/robots.txt` — fix domain, disallow admin/checkout/order/login

---

## Phase 1 — Slug Routing

### Task 1: Slug helpers

**Files:**
- Create: `src/utils/slugs.ts`

- [ ] **Step 1: Write the helper module**

```ts
// src/utils/slugs.ts
import type { Product } from "@/types/database";

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[×x](?=\d)/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const brandSlug = (brand: string) => slugify(brand);
export const productSlug = (name: string) => slugify(name);
export const setSlug = (name: string) => slugify(name);

export function productPath(p: { brand: string; name: string }): string {
  return `/product/${brandSlug(p.brand)}/${productSlug(p.name)}`;
}

export function setPath(c: { name: string }): string {
  return `/discovery-set/${setSlug(c.name)}`;
}

export function brandPath(brand: string): string {
  return `/brand/${brandSlug(brand)}`;
}

export function findProductByPath<T extends { brand: string; name: string; created_at: string }>(
  products: T[],
  brandSlugParam: string,
  productSlugParam: string,
): T | null {
  const matches = products.filter(
    (p) => brandSlug(p.brand) === brandSlugParam && productSlug(p.name) === productSlugParam,
  );
  if (matches.length === 0) return null;
  return [...matches].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )[0];
}

export function findSetBySlug<T extends { name: string; created_at: string }>(
  sets: T[],
  slug: string,
): T | null {
  const matches = sets.filter((s) => setSlug(s.name) === slug);
  if (matches.length === 0) return null;
  return [...matches].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )[0];
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
```

- [ ] **Step 2: Verify**

Run `npm run build`. Expected: PASS (no callers yet).

- [ ] **Step 3: Manual sanity check**

Add a one-shot console log in `src/main.tsx` (and revert): `import { slugify } from "./utils/slugs"; console.log(slugify("Le Labo"), slugify("Santal 33"), slugify("MFK Baccarat Rouge 540 Extrait"), slugify("Discovery Niche 5×5ml"));`. Open the dev server, confirm the console prints `le-labo santal-33 mfk-baccarat-rouge-540-extrait discovery-niche-5x5ml`. Revert the log.

- [ ] **Step 4: Commit**

```bash
git add src/utils/slugs.ts
git commit -m "Add slug helpers for product, brand, and set URLs"
```

---

### Task 2: Routing — products via brand/name slug

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/Product.tsx`

- [ ] **Step 1: Add new + legacy routes in `App.tsx`**

Find the existing product route (`<Route path=":lang/product/:id" element={<Product />} />` or similar) and replace it with:

```tsx
{/* Slug route — primary */}
<Route path=":lang/product/:brandSlugParam/:productSlugParam" element={<Product />} />
{/* Legacy UUID route — redirects to slug inside Product.tsx */}
<Route path=":lang/product/:idOrBrandSlug" element={<Product />} />
```

The single-segment legacy path catches both UUIDs (redirect) and accidental old links.

- [ ] **Step 2: Update `Product.tsx` lookup**

Replace the `useParams<{ id: string }>()` block + `useProduct(id)` flow with:

```tsx
const { idOrBrandSlug, brandSlugParam, productSlugParam } = useParams<{
  idOrBrandSlug?: string;
  brandSlugParam?: string;
  productSlugParam?: string;
}>();
const navigate = useNavigate();
const href = useLocalizedHref();
const { data: allProducts = [], isLoading: productsLoading } = useProducts();

// Legacy UUID → 301 redirect to slug
useEffect(() => {
  if (idOrBrandSlug && UUID_RE.test(idOrBrandSlug) && allProducts.length > 0) {
    const found = allProducts.find((p) => p.id === idOrBrandSlug);
    if (found) navigate(href(productPath(found)), { replace: true });
  }
}, [idOrBrandSlug, allProducts, navigate, href]);

const product =
  brandSlugParam && productSlugParam
    ? findProductByPath(allProducts, brandSlugParam, productSlugParam)
    : null;

const productLoading = productsLoading;
```

(Replace the existing `useProduct(id)` call entirely. Keep `useSKUs(product?.id || "")` after `product` is determined.)

- [ ] **Step 3: Imports + cleanup**

Add at the top of `Product.tsx`:
```tsx
import { useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { findProductByPath, productPath, UUID_RE } from "@/utils/slugs";
```

Remove the `useProduct` import line.

- [ ] **Step 4: Verify**

Run `npm run dev`. Open `/ro/product/le-labo/santal-33` (substitute a real brand/name from your DB). Page loads. Open `/ro/product/<some-real-uuid>`. Page redirects to slug URL. Open `/ro/product/nonexistent/foo`. PdpNotFound renders.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/pages/Product.tsx
git commit -m "Route products by brand/name slug; redirect legacy UUID URLs"
```

---

### Task 3: Routing — discovery sets via slug

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/DiscoverySetProduct.tsx`

- [ ] **Step 1: Add slug + legacy routes**

In `App.tsx`, replace the existing `<Route path=":lang/discovery-set/:id" ...>` with:

```tsx
<Route path=":lang/discovery-set/:slugOrId" element={<DiscoverySetProduct />} />
```

- [ ] **Step 2: Update `DiscoverySetProduct.tsx`**

Replace the `useParams<{ id }>()` + `useDiscoverySetConfig(id)` flow with:

```tsx
const { slugOrId } = useParams<{ slugOrId?: string }>();
const navigate = useNavigate();
const href = useLocalizedHref();
const { data: allConfigs = [], isLoading } = useDiscoverySetConfigs();

useEffect(() => {
  if (slugOrId && UUID_RE.test(slugOrId) && allConfigs.length > 0) {
    const found = allConfigs.find((c) => c.id === slugOrId);
    if (found) navigate(href(setPath(found)), { replace: true });
  }
}, [slugOrId, allConfigs, navigate, href]);

const config = slugOrId ? findSetBySlug(allConfigs, slugOrId) : null;
```

(Replace `useDiscoverySetConfig` import with `useDiscoverySetConfigs`. Drop the single-config hook usage.)

- [ ] **Step 3: Imports**

Add:
```tsx
import { useEffect } from "react";
import { useDiscoverySetConfigs } from "@/hooks/useDiscoverySets";
import { findSetBySlug, setPath, UUID_RE } from "@/utils/slugs";
```

- [ ] **Step 4: Verify**

Open `/ro/discovery-set/<existing-set-name-slugified>`, confirm page loads. Open `/ro/discovery-set/<uuid>`, confirm 301 to slug.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/pages/DiscoverySetProduct.tsx
git commit -m "Route discovery sets by name slug; redirect legacy UUID URLs"
```

---

### Task 4: Update all internal links

**Files:**
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/components/ProductListCard.tsx`
- Modify: `src/components/SearchOverlay.tsx`
- Modify: `src/components/BrandWall.tsx`
- Modify: `src/components/shop/BrandsView.tsx`
- Modify: `src/pages/DiscoverySets.tsx` (or wherever set cards link)

- [ ] **Step 1: Replace product link strings with `productPath`**

In each of `ProductCard.tsx`, `ProductListCard.tsx`, `SearchOverlay.tsx`: import `productPath` from `@/utils/slugs`. Replace any `` `/product/${product.id}` `` (or similar) with `productPath(product)`. Combine with `useLocalizedHref()` to keep language prefix.

Example pattern:
```tsx
import { productPath } from "@/utils/slugs";
// ...
<Link to={localizedHref(productPath(product))}>
```

- [ ] **Step 2: Replace brand link strings with `brandPath`**

In `BrandWall.tsx`, `BrandsView.tsx`, and any other place a brand is rendered as a link (currently `?brand=X` query strings): import `brandPath` from `@/utils/slugs`, link to `localizedHref(brandPath(brand))`.

(The shop's `?brand=` filter chip stays — query-string filtering still works for the in-shop filter sidebar UX. We're adding category pages, not removing the filter.)

- [ ] **Step 3: Replace discovery-set link strings with `setPath`**

Wherever discovery sets link to their detail page (look in `DiscoverySets.tsx`, `PredefinedSetsGrid.tsx`): use `setPath(config)`.

- [ ] **Step 4: Verify**

Run `npm run dev`. From the homepage, click a product card → URL is `/ro/product/brand-slug/product-slug`. Click a brand wordmark → URL is `/ro/brand/brand-slug`. Click a predefined set → URL is `/ro/discovery-set/set-slug`. Search overlay results also use the new slug paths.

- [ ] **Step 5: Commit**

```bash
git add src/components src/pages
git commit -m "Update all internal links to use slug helpers"
```

---

## Phase 2 — Brand Pages

### Task 5: New `Brand` page component

**Files:**
- Create: `src/pages/Brand.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write `Brand.tsx`**

```tsx
// src/pages/Brand.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/hooks/usePageMeta";
import { BrandLoader } from "@/components/BrandLoader";
import { usePricedProducts } from "@/hooks/usePricedProducts";
import { useAllSKUs, buildMinPriceMap, buildInStockMap, buildSkusByProductMap } from "@/hooks/useAllSKUs";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { ProductsView } from "@/components/shop/ProductsView";
import { brandSlug } from "@/utils/slugs";

const Brand = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const href = useLocalizedHref();
  const { t } = useTranslation("shop");
  const { data: products = [], isLoading: productsLoading } = usePricedProducts();
  const { data: allSkus = [], isLoading: skusLoading } = useAllSKUs();

  if (productsLoading || skusLoading) return <BrandLoader />;

  const brandProducts = products.filter((p) => brandSlug(p.brand) === slug);
  if (brandProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-4">
              {t("brand.notFound")}
            </h1>
            <Button variant="ghost" onClick={() => navigate(href("/shop"))}>{t("brand.back")}</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const brandName = brandProducts[0].brand;
  const priceByProduct = buildMinPriceMap(allSkus);
  const inStockByProduct = buildInStockMap(allSkus);
  const skusByProduct = buildSkusByProductMap(allSkus);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta namespace="shop" titleKey="brand.metaTitle" descriptionKey="brand.metaDescription" values={{ brand: brandName }} />
      <Header />
      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12">
          <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-2">{t("brand.eyebrow")}</p>
          <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">{brandName}</h1>
          <p className="text-caption text-text-muted mt-1 mb-8">{t("count.products", { count: brandProducts.length })}</p>
          <ProductsView
            products={brandProducts}
            filters={{ brand: [brandName], family: [], gender: "all", inStock: false }}
            onFiltersChange={() => {}}
            sort="featured"
            onSortChange={() => {}}
            query=""
            onQueryChange={() => {}}
            priceByProduct={priceByProduct}
            inStockByProduct={inStockByProduct}
            skusByProduct={skusByProduct}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Brand;
```

- [ ] **Step 2: Add i18n strings to `shop.json` (ro/ru/en)**

In each `src/i18n/locales/{ro,ru,en}/shop.json`, add a `"brand"` section:

```json
"brand": {
  "metaTitle": "{{brand}}",
  "metaDescription": "Parfumuri {{brand}} la ModestShop.",
  "eyebrow": "Brand",
  "notFound": "Brand inexistent",
  "back": "Înapoi la magazin"
}
```

(Translate `metaDescription`, `eyebrow`, `notFound`, `back` for `ru` and `en` — Russian: "Под маркой", "Бренд", "Бренд не найден", "Назад в магазин"; English: "Fragrances by {{brand}} at ModestShop.", "Brand", "Brand not found", "Back to shop".)

- [ ] **Step 3: Add the route in `App.tsx`**

```tsx
<Route path=":lang/brand/:slug" element={<Brand />} />
```

(Place near the shop/product routes.)

- [ ] **Step 4: Verify**

Open `/ro/brand/le-labo` (replace with a real brand slug). Page renders with brand name as `<h1>`, product count, and grid. Click a product card — slug URL navigation. Open a non-existent brand — "Brand inexistent" with a back button.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Brand.tsx src/App.tsx src/i18n/locales
git commit -m "Add brand category pages at /brand/:slug"
```

---

## Phase 3 — Pre-rendering

### Task 6: Install + integrate `vite-react-ssg`

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `src/main.tsx`
- Create: `src/lib/routes.ts`

- [ ] **Step 1: Install**

```bash
npm install vite-react-ssg
```

- [ ] **Step 2: Define a route table**

Create `src/lib/routes.ts` exporting a `routes` array consumable by `vite-react-ssg`:

```tsx
import type { RouteRecord } from "vite-react-ssg";
import { lazy } from "react";

const Index = lazy(() => import("@/pages/Index"));
const Shop = lazy(() => import("@/pages/Shop"));
const Product = lazy(() => import("@/pages/Product"));
const Brand = lazy(() => import("@/pages/Brand"));
const DiscoverySets = lazy(() => import("@/pages/DiscoverySets"));
const DiscoverySetProduct = lazy(() => import("@/pages/DiscoverySetProduct"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Careers = lazy(() => import("@/pages/Careers"));

export const routes: RouteRecord[] = [
  { path: "/", element: <Index /> },
  { path: ":lang", element: <Index /> },
  { path: ":lang/shop", element: <Shop /> },
  { path: ":lang/discovery-sets", element: <DiscoverySets /> },
  { path: ":lang/discovery-set/:slugOrId", element: <DiscoverySetProduct /> },
  { path: ":lang/product/:brandSlugParam/:productSlugParam", element: <Product /> },
  { path: ":lang/product/:idOrBrandSlug", element: <Product /> },
  { path: ":lang/brand/:slug", element: <Brand /> },
  { path: ":lang/about", element: <About /> },
  { path: ":lang/contact", element: <Contact /> },
  { path: ":lang/faq", element: <FAQ /> },
  { path: ":lang/privacy", element: <Privacy /> },
  { path: ":lang/terms", element: <Terms /> },
  { path: ":lang/careers", element: <Careers /> },
];
```

(Move `getStaticPaths` per-route in subsequent tasks.)

- [ ] **Step 3: Replace `src/main.tsx`**

```tsx
import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "@/lib/routes";
import "./index.css";

export const createRoot = ViteReactSSG({ routes });
```

(Delete the old `ReactDOM.createRoot(...).render(<App />)` block.)

- [ ] **Step 4: Update `App.tsx` to render via `Outlet`**

`vite-react-ssg` owns the router. `App.tsx` becomes a layout component. Wrap providers (QueryClientProvider, AuthProvider, I18nextProvider, etc.) around `<Outlet />`:

```tsx
import { Outlet } from "react-router-dom";
// ... keep existing provider imports
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HelmetProvider>
        <ScrollToTop />
        <Outlet />
        <Toaster />
      </HelmetProvider>
    </AuthProvider>
  </QueryClientProvider>
);
export default App;
```

Update `routes.ts` to wrap all routes under `App`:

```tsx
export const routes: RouteRecord[] = [
  { path: "/", element: <App />, children: [
    { index: true, element: <Index /> },
    { path: ":lang", element: <Index /> },
    // ... other routes
  ]},
];
```

- [ ] **Step 5: Update `package.json` script**

`vite-react-ssg` provides its own build script:

```json
"build": "vite-react-ssg build",
"build:client": "tsc && vite build"
```

Keep `build:client` as an escape hatch.

- [ ] **Step 6: Verify dev**

`npm run dev` — site loads, routing works, no SSR errors in console.

- [ ] **Step 7: Verify build (smoke)**

`npm run build`. Check `dist/`:
```bash
ls dist/ro/about/index.html
ls dist/ru/shop/index.html
```

Both files exist and contain `<h1>` with rendered text.

- [ ] **Step 8: Commit**

```bash
git add package.json vite.config.ts src/main.tsx src/App.tsx src/lib/routes.ts
git commit -m "Adopt vite-react-ssg for build-time pre-rendering"
```

---

### Task 7: Build-time data routes for products / brands / sets

**Files:**
- Modify: `src/lib/routes.ts`
- Create: `src/lib/getStaticPaths.ts`

- [ ] **Step 1: Implement `getStaticPaths`**

```ts
// src/lib/getStaticPaths.ts
import { createClient } from "@supabase/supabase-js";
import { brandSlug, productSlug, setSlug } from "@/utils/slugs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

const langs = ["ro", "ru", "en"];

export async function getStaticPaths() {
  const client = createClient(SUPABASE_URL, SUPABASE_KEY);

  const [{ data: products = [] }, { data: skus = [] }, { data: configs = [] }] = await Promise.all([
    client.from("products").select("id,brand,name,created_at"),
    client.from("skus").select("product_id"),
    client.from("discovery_set_configs").select("id,name,created_at,is_published"),
  ]);

  const productIdsWithSkus = new Set(skus.map((s) => s.product_id));
  const visibleProducts = products.filter((p) => productIdsWithSkus.has(p.id));

  const productPaths = langs.flatMap((lang) =>
    visibleProducts.map((p) => `/${lang}/product/${brandSlug(p.brand)}/${productSlug(p.name)}`),
  );

  const brandPaths = langs.flatMap((lang) =>
    Array.from(new Set(visibleProducts.map((p) => brandSlug(p.brand)))).map(
      (slug) => `/${lang}/brand/${slug}`,
    ),
  );

  const setPaths = langs.flatMap((lang) =>
    configs
      .filter((c) => c.is_published)
      .map((c) => `/${lang}/discovery-set/${setSlug(c.name)}`),
  );

  return [...productPaths, ...brandPaths, ...setPaths];
}
```

- [ ] **Step 2: Wire it into the SSG build**

In `src/lib/routes.ts`, set the `getStaticPaths` on each dynamic route:

```tsx
import { getStaticPaths } from "@/lib/getStaticPaths";
// ...
{ path: ":lang/product/:brandSlugParam/:productSlugParam", element: <Product />, getStaticPaths },
{ path: ":lang/brand/:slug", element: <Brand />, getStaticPaths },
{ path: ":lang/discovery-set/:slugOrId", element: <DiscoverySetProduct />, getStaticPaths },
```

(The same function returns all paths; `vite-react-ssg` filters by route shape.)

- [ ] **Step 3: Verify build**

`npm run build`. Build time grows. After build:

```bash
ls dist/ro/product | head
ls dist/ro/brand | head
ls dist/ro/discovery-set | head
```

Each lists generated route folders. Open one of `dist/ro/product/<brand>/<product>/index.html` in a browser — verify product name appears in the rendered HTML.

- [ ] **Step 4: Commit**

```bash
git add src/lib/getStaticPaths.ts src/lib/routes.ts
git commit -m "Generate static HTML for every product, brand, and discovery set"
```

---

## Phase 4 — Sitemap + robots.txt

### Task 8: `scripts/generate-sitemap.ts`

**Files:**
- Create: `scripts/generate-sitemap.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the generator**

```ts
// scripts/generate-sitemap.ts
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { join } from "path";
import { brandSlug, productSlug, setSlug } from "../src/utils/slugs";

const SITE = "https://modestshop.md";
const langs = ["ro", "ru", "en"] as const;

const STATIC_PATHS: Array<{ p: string; priority: number }> = [
  { p: "", priority: 1.0 },
  { p: "/shop", priority: 0.9 },
  { p: "/discovery-sets", priority: 0.9 },
  { p: "/about", priority: 0.5 },
  { p: "/contact", priority: 0.5 },
  { p: "/faq", priority: 0.5 },
  { p: "/privacy", priority: 0.3 },
  { p: "/terms", priority: 0.3 },
  { p: "/careers", priority: 0.3 },
];

(async () => {
  const client = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
  const [{ data: products = [] }, { data: skus = [] }, { data: configs = [] }] = await Promise.all([
    client.from("products").select("id,brand,name,updated_at"),
    client.from("skus").select("product_id"),
    client.from("discovery_set_configs").select("id,name,updated_at,is_published"),
  ]);

  const productIdsWithSkus = new Set(skus.map((s) => s.product_id));
  const visibleProducts = products.filter((p) => productIdsWithSkus.has(p.id));
  const visibleSets = configs.filter((c) => c.is_published);
  const brands = Array.from(new Set(visibleProducts.map((p) => p.brand)));

  type UrlEntry = { path: string; lastmod: string; priority: number };
  const entries: UrlEntry[] = [];

  STATIC_PATHS.forEach(({ p, priority }) =>
    entries.push({ path: p, lastmod: new Date().toISOString(), priority })
  );
  visibleProducts.forEach((p) =>
    entries.push({
      path: `/product/${brandSlug(p.brand)}/${productSlug(p.name)}`,
      lastmod: p.updated_at,
      priority: 0.8,
    })
  );
  brands.forEach((b) =>
    entries.push({ path: `/brand/${brandSlug(b)}`, lastmod: new Date().toISOString(), priority: 0.7 })
  );
  visibleSets.forEach((c) =>
    entries.push({ path: `/discovery-set/${setSlug(c.name)}`, lastmod: c.updated_at, priority: 0.7 })
  );

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    entries
      .flatMap((e) =>
        langs.map(
          (lang) =>
            `  <url>\n` +
            `    <loc>${SITE}/${lang}${e.path}</loc>\n` +
            `    <lastmod>${e.lastmod}</lastmod>\n` +
            `    <priority>${e.priority}</priority>\n` +
            langs
              .map(
                (alt) =>
                  `    <xhtml:link rel="alternate" hreflang="${alt}" href="${SITE}/${alt}${e.path}"/>`,
              )
              .join("\n") +
            `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/ro${e.path}"/>\n` +
            `  </url>`,
        ),
      )
      .join("\n") +
    `\n</urlset>\n`;

  writeFileSync(join(process.cwd(), "dist", "sitemap.xml"), xml, "utf-8");
  console.log(`sitemap.xml written: ${entries.length * langs.length} URLs`);
})();
```

- [ ] **Step 2: Wire into build**

Update `package.json`:

```json
"build": "vite-react-ssg build && ts-node --project tsconfig.scripts.json scripts/generate-sitemap.ts",
```

- [ ] **Step 3: Verify**

`npm run build`. Check `dist/sitemap.xml`:
```bash
head -30 dist/sitemap.xml
grep -c "<loc>" dist/sitemap.xml
```

Expect at least `(static + products + brands + sets) × 3` `<loc>` entries.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-sitemap.ts package.json
git commit -m "Generate sitemap.xml at build from Supabase with hreflang alternates"
```

---

### Task 9: `robots.txt`

**Files:**
- Modify: `public/robots.txt`

- [ ] **Step 1: Replace contents**

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /checkout
Disallow: /order
Sitemap: https://modestshop.md/sitemap.xml
```

- [ ] **Step 2: Verify**

After `npm run build`, fetch `dist/robots.txt` to confirm. After deploy, visit `https://modestshop.md/robots.txt`.

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "Update robots.txt domain and disallow private routes"
```

---

## Phase 5 — JSON-LD Structured Data

### Task 10: JSON-LD payload helpers

**Files:**
- Create: `src/utils/jsonLd.ts`

- [ ] **Step 1: Write the helpers**

```ts
// src/utils/jsonLd.ts
import type { Product, SKU } from "@/types/database";
import { brandSlug, productSlug } from "@/utils/slugs";

const SITE = "https://modestshop.md";

export function organizationJsonLd(lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ModestShop",
    "url": `${SITE}/${lang}`,
    "logo": `${SITE}/logo.png`,
    "sameAs": ["https://www.instagram.com/modest.shops/"],
  };
}

export function websiteJsonLd(lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": `${SITE}/${lang}`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE}/${lang}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(p: Product, skus: SKU[], lang: string) {
  const priced = skus.filter((s) => s.price > 0);
  const inStockPriced = priced.filter((s) => s.stock > 0);
  const minLei = priced.length > 0 ? Math.min(...priced.map((s) => s.price)) / 100 : null;

  let availability = "https://schema.org/PreOrder";
  if (inStockPriced.length > 0) availability = "https://schema.org/InStock";
  else if (priced.length > 0) availability = "https://schema.org/OutOfStock";

  const url = `${SITE}/${lang}/product/${brandSlug(p.brand)}/${productSlug(p.name)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.name,
    "image": p.image_url,
    "description": p.description ?? `${p.brand} ${p.name}`,
    "brand": { "@type": "Brand", "name": p.brand },
    "category": p.family ?? undefined,
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "MDL",
      ...(minLei !== null ? { "price": minLei.toFixed(2) } : {}),
      "availability": availability,
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((it, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": it.name,
      "item": it.url,
    })),
  };
}

export function itemListJsonLd(products: Product[], lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `${SITE}/${lang}/product/${brandSlug(p.brand)}/${productSlug(p.name)}`,
      "name": p.name,
    })),
  };
}

export function faqJsonLd(qas: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": qas.map((it) => ({
      "@type": "Question",
      "name": it.q,
      "acceptedAnswer": { "@type": "Answer", "text": it.a },
    })),
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ModestShop",
    "image": `${SITE}/logo.png`,
    "telephone": "+373 XXX XXX",
    "email": "hello@modestshop.md",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MD",
      "addressLocality": "Chișinău",
    },
    "url": SITE,
    "priceRange": "$$",
  };
}
```

(Replace placeholder phone/email with real values from the existing Contact page when wiring.)

- [ ] **Step 2: Verify build**

`npm run build`. No callers yet, but TypeScript compilation must succeed.

- [ ] **Step 3: Commit**

```bash
git add src/utils/jsonLd.ts
git commit -m "Add Schema.org JSON-LD payload builders"
```

---

### Task 11: Wire JSON-LD into pages

**Files:**
- Modify: `src/pages/Index.tsx`
- Modify: `src/pages/Product.tsx`
- Modify: `src/pages/Brand.tsx`
- Modify: `src/pages/Shop.tsx`
- Modify: `src/pages/FAQ.tsx`
- Modify: `src/pages/Contact.tsx`

- [ ] **Step 1: Helmet helper**

The cleanest way is a small reusable component:

```tsx
// inline helper inside each page or extract to src/components/JsonLd.tsx
import { Helmet } from "react-helmet-async";
export function JsonLd({ payload }: { payload: object }) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(payload)}</script>
    </Helmet>
  );
}
```

Create `src/components/JsonLd.tsx` with the above.

- [ ] **Step 2: Index page (homepage)**

In `src/pages/Index.tsx`, alongside `<PageMeta />`:

```tsx
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/utils/jsonLd";
const { i18n } = useTranslation();
// ...
<JsonLd payload={organizationJsonLd(i18n.language)} />
<JsonLd payload={websiteJsonLd(i18n.language)} />
```

- [ ] **Step 3a: Add breadcrumb i18n keys**

In each `src/i18n/locales/{ro,ru,en}/common.json`, add:

```json
"breadcrumb": {
  "home": "Acasă",
  "shop": "Magazin"
}
```

(Russian: `"Главная"`, `"Магазин"`. English: `"Home"`, `"Shop"`.)

- [ ] **Step 3: Product page**

In `Product.tsx`, after `product` and `skus` are determined:

```tsx
import { productJsonLd, breadcrumbJsonLd } from "@/utils/jsonLd";
// ...
{product && (
  <>
    <JsonLd payload={productJsonLd(product, skus, i18n.language)} />
    <JsonLd payload={breadcrumbJsonLd([
      { name: t("breadcrumb.home", { ns: "common" }), url: `https://modestshop.md/${i18n.language}` },
      { name: t("breadcrumb.shop", { ns: "common" }), url: `https://modestshop.md/${i18n.language}/shop` },
      { name: product.brand, url: `https://modestshop.md/${i18n.language}/brand/${brandSlug(product.brand)}` },
      { name: product.name, url: `https://modestshop.md/${i18n.language}/product/${brandSlug(product.brand)}/${productSlug(product.name)}` },
    ])} />
  </>
)}
```

(Add `home` and `shop` keys to `common.json` `breadcrumb` namespace per language.)

- [ ] **Step 4: Brand + Shop pages**

In each, emit `breadcrumbJsonLd` + `itemListJsonLd(brandProducts or filteredProducts, lang)`.

- [ ] **Step 5: FAQ page**

Walk the FAQ namespace's translated questions+answers, build `faqJsonLd([{ q, a }, ...])`. The shape depends on how FAQ is currently structured — read `src/pages/FAQ.tsx` first and adapt.

- [ ] **Step 6: Contact page**

`<JsonLd payload={localBusinessJsonLd()} />`. Update phone/email constants in `localBusinessJsonLd()` with real values.

- [ ] **Step 7: Verify**

After `npm run build`, open one of `dist/ro/product/<brand>/<slug>/index.html` in a text editor — the rendered HTML should contain a `<script type="application/ld+json">` block with the Product schema. Validate one page on https://search.google.com/test/rich-results.

- [ ] **Step 8: Commit**

```bash
git add src/pages src/components/JsonLd.tsx src/i18n/locales
git commit -m "Emit Schema.org JSON-LD on all major page types"
```

---

## Phase 6 — Meta + Image + Perf Polish

### Task 12: Image alt audit + ESLint

**Files:**
- Modify: `.eslintrc.json`
- Modify: any `<img>` callers missing alt or with non-descriptive alt

- [ ] **Step 1: Promote alt-text rule to error**

In `.eslintrc.json`:
```json
{
  "rules": {
    "jsx-a11y/alt-text": "error"
  }
}
```

- [ ] **Step 2: Run lint, fix violations**

```bash
npm run lint
```

For each error:
- Product images → `alt={`${product.brand} ${product.name}`}`
- Brand wordmarks → `alt={brand}`
- Decorative / loader / icon-like images → `alt=""` (intentionally empty)
- Photographic content → describe what's depicted

- [ ] **Step 3: Verify**

`npm run lint` exits clean (zero warnings/errors per the existing `--max-warnings 0` policy).

- [ ] **Step 4: Commit**

```bash
git add .eslintrc.json src
git commit -m "Promote alt-text ESLint rule to error and fix violations"
```

---

### Task 13: index.html meta + hero LCP

**Files:**
- Modify: `index.html`
- Modify: `src/components/HeroSection.tsx`

- [ ] **Step 1: Add meta tags**

In `index.html` `<head>`:

```html
<meta name="theme-color" content="#1a1814" />
<meta name="application-name" content="ModestShop" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="ModestShop" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="apple-touch-icon" href="/logo.png" />
```

(Adjust `og:image:width/height` later when branded OG cards are introduced.)

- [ ] **Step 2: Hero LCP hint**

In `src/components/HeroSection.tsx`, on the `<img src={HERO_IMAGE_PATH} ...>`, add:

```tsx
fetchPriority="high"
```

(React 18.3+ accepts the camelCase `fetchPriority` prop.)

- [ ] **Step 3: Verify**

Run `npm run build`, open `dist/index.html`, confirm the meta tags. Run a Lighthouse perf audit in Chrome DevTools — LCP score should remain ≥ 90 with the hero loaded as a high-priority image.

- [ ] **Step 4: Commit**

```bash
git add index.html src/components/HeroSection.tsx
git commit -m "Polish meta tags and prioritize hero image LCP"
```

---

## Verification (Post-implementation)

1. **Build smoke:** `npm run build` succeeds in <90s; `dist/` has HTML for ≥30 routes; `dist/sitemap.xml` lists ≥ N×3 URLs (N = static + products + brands + sets).
2. **Static HTML inspection:** `cat dist/ro/product/le-labo/santal-33/index.html | grep -E 'name=|<title>|application/ld\+json|hreflang'` shows full meta + JSON-LD + hreflang.
3. **Lighthouse SEO:** ≥95 on home, shop, a product page, a brand page.
4. **Rich Results Test:** https://search.google.com/test/rich-results passes for Product + BreadcrumbList on a sample PDP.
5. **Mobile-friendly test:** passes for the same set.
6. **Sitemap fetch:** after deploy, `curl https://modestshop.md/sitemap.xml | head` shows ~hundreds of URLs.
7. **301 redirect smoke:** `/ro/product/<old-uuid>` redirects to `/ro/product/<brand>/<slug>` (browser network tab shows 301 → 200).

---

## Self-Review Notes

- All slug references (sections, helpers, route patterns) consistently use one helper module (`src/utils/slugs.ts`).
- No `TODO` / placeholder text in code blocks — every file is shown in full or with explicit `(reuse existing X)` notes.
- `vite-react-ssg` integration is the highest-risk task (Task 6); plan splits it into 8 atomic steps with verification at each.
- Phases ship value independently: after Phase 1 the site has slug URLs (already an SEO win); after Phase 4, full crawlability; Phase 5–6 layer richness on top.
- All Supabase reads at build use the anon key (no service role exposure), matching existing security model.
- `PageMeta` (`usePageMeta.tsx`) already emits hreflang based on the current pathname — slug paths flow through unchanged because `stripLang` works on whatever path is in the URL.
