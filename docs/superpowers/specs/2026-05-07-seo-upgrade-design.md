# SEO Upgrade — Design Spec

**Date:** 2026-05-07
**Author:** brainstorming session

## Goal

Make `modestshop.md` discoverable by search engines and rich for social sharing across all 3 supported languages (RO/RU/EN), without locking the design to any specific host (current Vercel prototype, future self-hosted).

## Architecture Summary

Currently a Vite SPA: bots load the shell, run JS, and pull data from Supabase before any catalog HTML exists. Google can render this slowly; Bing and most social-card scrapers cannot. Plus the current `sitemap.xml` and `robots.txt` reference a stale domain (`scent-discovery-vault.com`) and only list two URLs.

The upgrade has five pillars:

1. **Pre-render every public route to static HTML at build time** using `vite-react-ssg`. The `dist/` artifact contains real HTML per URL (one file per language × route), so any web server can serve it — no runtime SSR, no Vercel-specific features.
2. **Generate `sitemap.xml` at build time from Supabase** so brands, products, and static pages are listed canonically with `hreflang` alternates inline.
3. **Inject JSON-LD structured data** per page type (Organization, WebSite, Product, BreadcrumbList, ItemList, FAQPage, LocalBusiness).
4. **Add dedicated brand routes** (`/{lang}/brand/:slug`) so each brand has a distinct, indexable category page instead of being a tab inside `/shop`.
5. **Polish meta + perf**: Twitter handle, theme-color, OG dimensions, image-alt audit, hero `fetchpriority=high`, lazy-loading below the fold.

## Tech Stack

- **Pre-render:** `vite-react-ssg` (Vite-native, React 18, replaces React Router during the build)
- **Sitemap generator:** new TypeScript script run as part of `npm run build` (uses existing Supabase service-role-free client + anon key for read-only fetches)
- **Structured data:** plain `<script type="application/ld+json">` injected via `react-helmet-async` (already used by `usePageMeta`)
- **No new runtime deps for end users** — all SEO work is build-time

---

## 1. Pre-rendering with `vite-react-ssg`

### What

Replace the runtime `BrowserRouter` setup with `vite-react-ssg`'s router. At `vite build`, the tool walks all routes, renders each to HTML, and writes `dist/<route>/index.html` files. The same JS bundle hydrates on the client at runtime — so interactivity stays identical to today.

### Routes to pre-render (per language: ro, ru, en)

**Static (10):** `/`, `/shop`, `/shop?view=brands`, `/discovery-sets`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/careers`

**Dynamic:**
- Per product: `/product/:brandSlug/:productSlug` (e.g. `/product/le-labo/santal-33`) — fetched from Supabase at build (~40 active products today, room to grow). See "Product URL Slugs" below.
- Per brand: `/brand/:slug` — derived from distinct `products.brand` values (e.g. `/brand/le-labo`)
- Per discovery set: `/discovery-set/:slug` (e.g. `/discovery-set/niche-5x5ml`) — fetched from `discovery_set_configs` rows where `is_published = true`. See "Slug Strategy" below.
- Per language root: `/ro`, `/ru`, `/en` (handled via the route table)

**Excluded from pre-render (NoIndex'd or kept SPA-only):**
- `/admin/*` — explicitly `noindex,nofollow`
- `/login` — `noindex`
- `/checkout`, `/checkout/success/:orderId`, `/order/:orderId` — `noindex` (transactional, user-specific)

### Why hosting-agnostic

The pre-render output is plain HTML in a flat `dist/` folder. It works on:
- Vercel (current) — no config needed beyond what's already in `vercel.json`
- Self-hosted Nginx/Apache — serve `dist/` as static root with a fallback to `index.html` for unknown routes
- CDN-fronted static hosting (S3+CloudFront, Cloudflare Pages, etc.)

The only host-specific bit today is `vercel.json`'s redirects (no-prefix → `/ro` prefix) and SPA fallback. When migrating off Vercel, those rules need to be re-implemented in Nginx config (one-time port).

### Trade-offs

- **Build time grows:** rough estimate ~30–60s for the full catalog × 3 langs (each route renders headlessly). Acceptable on CI.
- **Data is snapshotted at build:** new products only appear after a rebuild. Freshness handled separately (see "Catalog Freshness" below).
- **Hydration mismatches:** the `usePageMeta` hook uses `useTranslation`; pre-rendering must initialize i18next per route. `vite-react-ssg` supports this via its async per-route data hooks.

---

## 2. Build-time `sitemap.xml`

### What

Replace the static `public/sitemap.xml` with a build-time generator. New script: `scripts/generate-sitemap.ts`, invoked from `package.json` as part of `npm run build`.

### Behaviour

1. Connect to Supabase (anon key, read-only — no service role)
2. Fetch:
   - All `products` (id, brand, slug if any, updated_at)
   - All distinct `products.brand` values (for brand pages)
   - All published `discovery_set_configs`
3. Emit `dist/sitemap.xml` with one `<url>` per (route, language) combination, plus `<xhtml:link rel="alternate" hreflang="..."/>` siblings for the other two languages
4. `<lastmod>` for product URLs comes from `updated_at`; for static routes, it's the build timestamp
5. `<priority>` and `<changefreq>` set conservatively (home=1.0, shop=0.9, product=0.8, brand=0.7, static=0.5)

### `robots.txt` fix

Replace the current file:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /checkout
Disallow: /order
Sitemap: https://modestshop.md/sitemap.xml
```

When the production domain changes, update `SITE_BASE_URL` in one place (`src/hooks/usePageMeta.tsx` already centralizes this).

---

## 3. JSON-LD Structured Data

Each page emits a `<script type="application/ld+json">` block via Helmet.

### Per-page-type spec

**Homepage (`/{lang}`):**
- `Organization`: `name`, `url`, `logo`, `sameAs` (Instagram), `contactPoint` (email/phone from Contact page)
- `WebSite` with `potentialAction` = `SearchAction` pointing at `/{lang}/shop?q={search_term_string}`

**Product page (`/{lang}/product/:id`):**
- `Product`: `name`, `image` (full URL), `description`, `brand` (as nested `Brand`), `category` (= `family`)
- `offers` = `Offer` with:
  - `priceCurrency: "MDL"`
  - `price`: lowest `sku.price / 100` across SKUs that have `price > 0`; if no priced SKU exists, omit the `price` field
  - `availability` decided by three cases, in order:
    1. Any SKU with `stock > 0 AND price > 0` → `https://schema.org/InStock`
    2. At least one SKU with `price > 0` but all priced SKUs have `stock = 0` → `https://schema.org/OutOfStock`
    3. No SKU has `price > 0` (all are "La comandă") → `https://schema.org/PreOrder`
  - `url`: canonical product URL
- `BreadcrumbList`: Home → Shop → Brand → Product

**Shop / Brand category pages:**
- `BreadcrumbList`
- `ItemList` of products with `position`, `url`, `name`, `image`

**FAQ page:**
- `FAQPage` with each Q&A from `static.faq` translation namespace as `Question`/`Answer`

**About / Contact page:**
- `LocalBusiness`: `name`, `address` (Moldova), `telephone`, `openingHours`, `geo` (if known), `priceRange: "$$"`, `image`

### Why these and not others

We're skipping `Review`, `AggregateRating`, `Article`, etc. for now — no editorial content or reviews exist. Easy to add later if a blog or reviews ship.

---

## 4. Brand Pages (new routes)

### What

Add a route `/{lang}/brand/:slug` rendered by a new component `src/pages/Brand.tsx`. Each brand page shows:
- Brand wordmark / image (already supplied by `BrandImageManager`)
- Short brand description (translated, in `shop.json` or new `brand.json` namespace)
- Filtered product grid for that brand
- Breadcrumb: Home → Shop → Brand
- Page-level JSON-LD: `Brand` + `ItemList`

### Slug convention

Brand pages use the shared `brandSlug(brand)` helper from `src/utils/slugs.ts` (defined in section 4b). Stored as a derived value, no DB column — kept simple, no migration needed. Mismatch protection: slug must match exactly one brand at lookup; if multiple/none, the page 404s.

### Internal linking

Update `BrandsView.tsx` and `BrandWall.tsx` so brand cards link to `/brand/:slug` instead of `/shop?brand=...`. Existing query-string filters keep working for users who navigate via the filter sidebar (no breaking change).

---

## 4b. Slug Strategy

### Product URLs: nested `/product/:brandSlug/:productSlug`

Replace `/product/:id` (UUID) with `/product/:brandSlug/:productSlug`. The hierarchy mirrors the catalog and gives Google a clean signal about brand → product. Examples:

| Brand · Name | URL |
|---|---|
| Le Labo · Santal 33 | `/product/le-labo/santal-33` |
| Tom Ford · Bitter Peach | `/product/tom-ford/bitter-peach` |
| MFK · Baccarat Rouge 540 Extrait | `/product/mfk/baccarat-rouge-540-extrait` |

The `brandSlug` is identical to the one used by the brand page route (`/brand/:slug`) — same helper, single source of truth. The `productSlug` is just the product name slugified (not brand-prefixed, since the brand is already in the path).

### Discovery set URLs: `/discovery-set/:slug`

Replace `/discovery-set/:id` with `/discovery-set/:slug` where `slug = slugify(config.name)`. Examples:

| Set name | URL |
|---|---|
| Discovery Niche 5×5ml | `/discovery-set/discovery-niche-5x5ml` |
| Sample Pack — Modern Florals | `/discovery-set/sample-pack-modern-florals` |

### Slug helpers

`src/utils/slugs.ts` exports:
- `slugify(input: string) → string` — lowercases, NFD-normalizes diacritics, strips them, replaces non-alphanumerics (including `×`/`x` boundaries) with `-`, dedupes consecutive `-`s, trims leading/trailing `-`s. Pure, no I/O.
- `brandSlug(brand: string) → string` = `slugify(brand)`
- `productSlug(name: string) → string` = `slugify(name)` (no brand prefix — brand lives in the parent path segment)
- `setSlug(name: string) → string` = `slugify(name)`
- `findProductByPath(products, brandSlugParam, productSlugParam) → Product | null` — filters products to those whose `brandSlug(p.brand) === brandSlugParam`, then matches the first by `productSlug(p.name) === productSlugParam` (oldest `created_at` wins on collision)
- `findSetBySlug(sets, slug) → Config | null` — analogous
- `productPath(p: { brand, name }) → string` returns `/product/${brandSlug(p.brand)}/${productSlug(p.name)}` — single source of truth for outbound links
- `setPath(c: { name }) → string` returns `/discovery-set/${setSlug(c.name)}`

No DB columns added — slugs are derived. For ~40 products the linear scan is trivial. Add a `slug` column later only if the catalog grows past a few thousand or if SEO requires guaranteed-stable URLs across renames.

### Collision handling

Within the same brand, two products with the same name is rare. If it happens, the oldest by `created_at` wins; the duplicate stays reachable via the legacy UUID redirect. No silent data loss — the row exists, it's just not at the slug URL until renamed. Same rule for discovery sets.

### Backwards compatibility: legacy UUID URLs

Keep `/product/:id` and `/discovery-set/:id` working as 301-redirect entry points. The route resolver checks the param shape: if it's a UUID (`/^[0-9a-f-]{36}$/i`), look up by `id` and `replace`-navigate to the slug URL; otherwise the route is `/product/:brandSlug/:productSlug` (or `/discovery-set/:slug`) and we look up by slug. This protects:
- Admin links / shares
- Any external bookmarks / search results indexed before the migration
- Internal code paths that haven't been updated yet (defensive)

### Internal links to update

`<Link to>` and `navigate(...)` callers that build product URLs:
- `src/components/ProductCard.tsx`
- `src/components/ProductListCard.tsx`
- `src/components/SearchOverlay.tsx`
- Anywhere else `/product/` or `/discovery-set/` appears in `src/`

After this change, every link uses the helpers (`productPath(product)` / `setPath(config)`) — they are the single source of truth so URL shape can evolve in one place.

---

## 5. Meta + Image + Perf Polish

### Meta in `index.html` (default fallback for first paint)

- `<meta name="theme-color" content="#1a1814" />`
- `<meta name="application-name" content="ModestShop" />`
- `<meta property="og:image:width" content="1200" />` + `og:image:height` (when we ship branded OG cards; for now, square logo, document the limit)
- Apple touch icon, manifest

### Per-product OG image (today's compromise)

Use `product.image_url` directly. Most product images are square ≤ 600×600 — Facebook/Twitter accept these but render small. Document in a follow-up that branded 1200×630 OG cards (logo + product image overlay) would be a separate ticket; out of scope for this upgrade.

### Image alt sweep

Audit all `<img>` tags in `src/components/**` and `src/pages/**`:
- Product images → `alt={`${product.brand} ${product.name}`}`
- Brand wordmarks → `alt={brand}`
- Hero / decorative → `alt=""` (intentionally empty per ARIA spec)
- Loader / icons → already aria-hidden

### LCP / CLS

- Hero image (`HeroSection.tsx`): add `fetchpriority="high"` (currently `loading="eager"` only)
- Below-fold images already use `loading="lazy"`
- Reserve aspect ratios on product cards (already done via `aspect-square`)

---

## Catalog Freshness

Build-time pre-rendering means new products are not in HTML until the next deploy. Three rebuild trigger options, decided per-environment:

| Environment | Trigger |
|---|---|
| Vercel (today) | Manual redeploy in Vercel dashboard, OR Vercel deploy hook if you want automation later |
| Self-hosted (future) | CI job (cron / webhook from admin / git push to a branch) |

This spec doesn't lock the choice — the build itself is deterministic and portable. **The default rebuild story we document in `README.md`:** "After admin product/SKU changes, redeploy the site to update search visibility. Allow ~1–2 minutes for the rebuild."

---

## Out of Scope

- Branded OG cards (per-product 1200×630 with logo overlay)
- Reviews / ratings (no source data)
- Blog / editorial content for long-tail SEO
- Server-side rendering at request time (would require a Node runtime in production)
- Search Console / Bing Webmaster setup (post-launch ops, not code)
- Site search internals (already adequate)

## Verification

After implementation:

1. **Build smoke test:** `npm run build` succeeds in <90s; `dist/` contains `index.html` for at least 30 routes; `dist/sitemap.xml` lists ≥ N×3 URLs (N = static + products + brands)
2. **Static HTML inspection:** `curl https://modestshop.md/ro/product/<id>` (after deploy) returns full HTML with the product name in `<title>`, JSON-LD in body, and hreflang `<link>` tags in head
3. **Lighthouse SEO score:** ≥95 on home, shop, and a product page
4. **Rich Results Test:** https://search.google.com/test/rich-results passes for Product + BreadcrumbList on a sample PDP
5. **Mobile-friendly test:** passes for the same set
6. **Image alt audit:** ESLint rule `jsx-a11y/alt-text` set to `error` (currently warn-or-off); CI catches regressions

## Assumptions / Defaults Locked In

- Domain: `https://modestshop.md`
- Languages: ro (default), ru, en
- No Twitter handle yet (skipped from `<meta name="twitter:site">`)
- LocalBusiness address pulled from existing Contact page strings
- "By request" / 0-price products use `availability: PreOrder` in Product schema
- Out-of-stock products with prices use `availability: OutOfStock`

If any assumption is wrong, raise it before plan-writing — easier to change here than mid-implementation.
