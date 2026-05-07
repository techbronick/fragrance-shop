# Redesign Phase 2 — Shop

**Date:** 2026-04-27
**Project:** Apple-caliber redesign of modestshop.md
**Phase:** 2 (page-level redesigns) — third sub-page: **Shop (`/shop`)**
**Status:** spec — awaiting review

## Single job

> The Shop helps a customer narrow the catalog to a few candidates worth considering.

Two paths to narrow:
- **By brand** ("I want Le Labo")
- **By attribute** ("woody, unisex, in stock")

The Shop preserves both paths through two views: a default Products view and a one-click Brands view.

## Phase context

PDP and Home redesigns shipped earlier today. This is the third Phase 2 sub-project. Phase 1 design tokens, primitives, and the cleaned `<ProductCard>` / `<ProductListCard>` are the substrate. After Shop, only Checkout remains in Phase 2.

## Decisions captured

| # | Decision | Rationale |
|---|---|---|
| 1 | Single job is "narrow the catalog" | Justifies preserving the filtering/sorting machinery |
| 2 | Two views (Products default, Brands toggle) — Q1 A | Brand-loyal niche-fragrance customers need the alphabetical brand path |
| 3 | Filter visibility: slim sidebar always-visible on desktop, Sheet-toggled on mobile, active-filter chips above grid (hybrid Q2) | Best of A + D — persistent filters where they fit, on-demand where they don't |
| 4 | Keep all 5 sort options (Q3 i) + add 6th `În stoc primele` (D fix) | User chose conservative |
| 5 | Keep both grid AND list view (Q3 a) | User chose conservative |
| 6 | Load more button instead of pagination (Q3 y) | User chose more relaxed feel |
| 7 | Keep in-page search input (Q3 p) | User chose conservative |
| 8 | Brands view simplified — drop A-Z jump strip, drop card/compact toggle, keep search + alphabetical sections (Q4 B) | Fewer toggles, more focus |
| 9 | Add `Doar produse în stoc` filter checkbox (D) | Shoppers can hide backorder items |
| 10 | URL persists view, filters, sort, search; Load-more count stays in client state | Sharable links work; "I had loaded 72" doesn't need to be sharable |

## Non-goals

- No DB schema changes (uses existing `products.stock_volume` for the in-stock filter/sort)
- No new copy beyond the new filter / sort labels
- No new primitives (consumes Phase 1 Button, Input, Select, Sheet, Badge, ProductCard, ProductListCard, BrandCard)
- No multi-language support (parked behind redesign)
- No keyboard-shortcut UX (the previous Ctrl+K / "/" for brand search is removed; the header search overlay from Phase 1 owns ⌘K globally)
- No analytics / tracking events
- No saved-search / favorited-filter feature
- No infinite scroll (kept as Load-more button per Q3)

## Architecture

### File map

**Modified:**
- `src/pages/Shop.tsx` — becomes orchestration + view toggle. Owns URL state (`view`, `brand`, `family`, `gender`, `inStock`, `sort`, `q`); reads `useProducts()`; dispatches to one of two view components. Roughly 100–150 lines after restructure (down from the much larger current file).

**Created:**
- `src/components/shop/ProductsView.tsx` — toolbar + sidebar + active filter chips + grid/list + load-more
- `src/components/shop/BrandsView.tsx` — brand search + alphabetical brand sections
- `src/components/shop/FilterSidebar.tsx` — single component used as a sidebar on desktop, contents reused inside a Sheet on mobile

**Reused (no changes unless minor cleanup needed):**
- `<ProductCard>` (Phase 1 Task 6 — already cleaned)
- `<ProductListCard>` (Phase 1 Task 6 — already cleaned)
- `<BrandCard>` — verify no `bg-gradient-*` or `hover:scale-*` remain; clean if found
- `<Button>`, `<Input>`, `<Select>`, `<Sheet>`, `<Badge>`, `<Checkbox>`, `<RadioGroup>` (Phase 1 primitives)

**Dropped (dead code after this phase):**
- `<AlphabetIndex>` — A-Z jump strip removed per Q4
- `<BrandsControlsBar>` — collapsed into the page header / view toggles
- The card-vs-compact mode toggle and its localStorage persistence
- The Ctrl+K / "/" keyboard shortcut for brand search (header overlay handles this)

### View toggle

- Default: `/shop` renders `<ProductsView>`
- `/shop?view=brands` renders `<BrandsView>`
- A simple `Produse · Branduri` toggle at the top of the page header. Click switches by updating the URL.

```tsx
<div className="flex gap-6 mb-8">
  <Link
    to="/shop"
    className={
      isProductsView
        ? "text-text-strong font-medium"
        : "text-text-muted hover:text-text duration-instant ease-default"
    }
  >
    Produse
  </Link>
  <Link
    to="/shop?view=brands"
    className={
      isBrandsView
        ? "text-text-strong font-medium"
        : "text-text-muted hover:text-text duration-instant ease-default"
    }
  >
    Branduri
  </Link>
</div>
```

### URL state shape

| Param | Values | Default | Notes |
|---|---|---|---|
| `view` | `products` (default) / `brands` | products | Switches view component |
| `brand` | comma-separated brand names | — | Multi-select |
| `family` | comma-separated families | — | Multi-select |
| `gender` | `male` / `female` / `unisex` / unset | unset | Single-select |
| `inStock` | `1` if checked, unset otherwise | unset | Boolean |
| `sort` | `featured` / `price-asc` / `price-desc` / `name` / `newest` / `in-stock-first` | `featured` | Single |
| `q` | search query | — | Free text |

Load-more state stays client-only — refresh resets to 24.

## Page header

```tsx
<div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12">
  <div className="flex gap-6 mb-8">
    {/* Produse · Branduri view toggle (markup above) */}
  </div>
  <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">Magazin</h1>
  <p className="text-caption text-text-muted mt-1">
    {isBrandsView ? `${brandCount} branduri` : `${filteredCount} produse`}
  </p>
</div>
```

The page H1 stays `Magazin` regardless of view; only the count caption changes.

## Products view

### Layout (desktop)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌────────────┐ ┌────────────────────────────────────────────────┐  │
│ │ FILTRE     │ │ [search] [sort ▾] [▦ ▤]                        │  │
│ │ Brand      │ │ Brand: Le Labo ✕   Familie: Lemnos ✕  Șterge   │  │
│ │ ☐ Amouage  │ │ ──────────────────────────────────────────────  │  │
│ │ ☐ Creed    │ │ ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │  │
│ │ ☐ Le Labo  │ │ │ ▢ │ │ ▢ │ │ ▢ │ │ ▢ │   4-col grid          │  │
│ │ Vezi toate │ │ └────┘ └────┘ └────┘ └────┘                    │  │
│ │            │ │ ...                                              │  │
│ │ Familie    │ │ [ Încarcă mai multe ]                            │  │
│ │ Gen        │ └────────────────────────────────────────────────┘  │
│ │ Disponib.  │                                                       │
│ │ Șterge     │                                                       │
│ └────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Grid

- **Mobile (`< md`):** 2 cols, `gap-4`
- **Tablet (`md` – `lg`):** 3 cols, `gap-6`
- **Desktop (`lg+`):** 4 cols, `gap-6` — Phase 1 spec'd ceiling

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
  {visibleProducts.map(p => <ProductCard key={p.id} product={p} />)}
</div>
```

### List view (alternative to grid)

When user toggles to list mode:

```tsx
<div className="flex flex-col gap-4">
  {visibleProducts.map(p => <ProductListCard key={p.id} product={p} />)}
</div>
```

### Toolbar

```tsx
<div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
  <Input
    placeholder="Caută produse..."
    value={query}
    onChange={(e) => updateQuery(e.target.value)}
    className="sm:max-w-sm"
  />
  <div className="flex items-center gap-2 sm:ml-auto">
    <Select value={sort} onValueChange={updateSort}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="featured">Recomandate</SelectItem>
        <SelectItem value="in-stock-first">În stoc primele</SelectItem>
        <SelectItem value="price-asc">Preț ↑</SelectItem>
        <SelectItem value="price-desc">Preț ↓</SelectItem>
        <SelectItem value="name">Nume A-Z</SelectItem>
        <SelectItem value="newest">Cele mai noi</SelectItem>
      </SelectContent>
    </Select>
    <ViewModeToggle value={viewMode} onChange={updateViewMode} />
    {/* Mobile-only Filter button */}
    <Button
      variant="secondary"
      size="md"
      className="lg:hidden"
      onClick={() => setMobileFiltersOpen(true)}
    >
      Filtre {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
    </Button>
  </div>
</div>
```

### Active filter chips

```tsx
{activeFilters.length > 0 && (
  <div className="flex flex-wrap items-center gap-2 mb-6">
    {activeFilters.map(f => (
      <button
        key={f.key}
        type="button"
        onClick={() => removeFilter(f.key)}
        aria-label={`Elimină filtrul: ${f.label}`}
        className="duration-instant ease-default"
      >
        <Badge variant="outline" className="cursor-pointer hover:bg-surface-2">
          {f.label} <X className="h-3 w-3 ml-1" />
        </Badge>
      </button>
    ))}
    {activeFilters.length > 1 && (
      <button
        type="button"
        onClick={clearAll}
        className="text-caption text-text-muted hover:text-text duration-instant ease-default"
      >
        Șterge toate
      </button>
    )}
  </div>
)}
```

### Load more

```tsx
{visibleCount < filteredProducts.length && (
  <div className="flex justify-center mt-12">
    <Button variant="secondary" size="lg" onClick={() => setVisibleCount(c => c + 24)}>
      Încarcă mai multe
    </Button>
  </div>
)}
```

- Initial `visibleCount = 24`
- Each click: +24 more
- Hidden when all results are visible

## Filter sidebar

`<FilterSidebar>` is a single component. Rendered inline on desktop (`hidden lg:block`) and inside a `<Sheet>` on mobile.

Sections in order:

### 1. Brand

```tsx
<div className="mb-8">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-3">
    Brand
  </p>
  <div className="space-y-2">
    {(brands.slice(0, brandsExpanded ? brands.length : 8)).map(b => (
      <label key={b} className="flex items-center gap-2 cursor-pointer">
        <Checkbox
          checked={filters.brand.includes(b)}
          onCheckedChange={() => toggleBrand(b)}
        />
        <span className="text-body text-text">{b}</span>
      </label>
    ))}
  </div>
  {brands.length > 8 && (
    <button
      type="button"
      onClick={() => setBrandsExpanded(e => !e)}
      className="text-caption text-text-muted hover:text-text mt-2 duration-instant ease-default"
    >
      {brandsExpanded ? 'Vezi mai puțin ↑' : `Vezi toate (${brands.length}) ↓`}
    </button>
  )}
</div>
```

### 2. Familie

Same checkbox-list pattern as Brand. Same expand-collapse if more than 8.

### 3. Gen

```tsx
<div className="mb-8">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-3">
    Gen
  </p>
  <RadioGroup value={filters.gender ?? 'all'} onValueChange={updateGender}>
    <Row label="Toate" value="all" />
    <Row label="Bărbați" value="male" />
    <Row label="Femei" value="female" />
    <Row label="Unisex" value="unisex" />
  </RadioGroup>
</div>
```

### 4. Disponibilitate (new — per Q-D)

```tsx
<div className="mb-8">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-3">
    Disponibilitate
  </p>
  <label className="flex items-center gap-2 cursor-pointer">
    <Checkbox
      checked={filters.inStock}
      onCheckedChange={(v) => updateInStock(!!v)}
    />
    <span className="text-body text-text">Doar produse în stoc</span>
  </label>
</div>
```

### Clear all

At the bottom (only visible when at least one filter is active):

```tsx
{activeFilterCount > 0 && (
  <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
    Șterge filtrele
  </Button>
)}
```

### Sticky positioning (desktop only)

```tsx
<aside className="hidden lg:block lg:w-56 shrink-0 lg:sticky lg:top-24 lg:self-start">
  <FilterSidebar ... />
</aside>
```

## Mobile filter sheet

```tsx
<Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
  <SheetContent side="right" className="w-full sm:max-w-[380px] bg-surface p-0 flex flex-col">
    <SheetHeader className="px-6 py-4 border-b border-border">
      <SheetTitle className="text-h2 font-medium text-text-strong">
        Filtre
      </SheetTitle>
    </SheetHeader>
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <FilterSidebar ... />
    </div>
    <div className="border-t border-border px-6 py-4">
      <SheetClose asChild>
        <Button variant="primary" size="lg" className="w-full">
          Aplică
        </Button>
      </SheetClose>
    </div>
  </SheetContent>
</Sheet>
```

## Sort logic

For `In-stock first`:

```ts
function sortInStockFirst(a: Product, b: Product): number {
  const aIn = a.stock_volume > 0 ? 0 : 1;
  const bIn = b.stock_volume > 0 ? 0 : 1;
  if (aIn !== bIn) return aIn - bIn;
  // Secondary key: rating desc, then name asc
  if (b.rating !== a.rating) return b.rating - a.rating;
  return a.name.localeCompare(b.name, 'ro');
}
```

For other sorts, preserve current behavior:
- `featured` — initial order from `useProducts()` (sorted by `created_at desc` already in the hook)
- `price-asc` / `price-desc` — by `min(skus.price)` per product (computed lazily; falls back to product field if no SKUs)
- `name` — `localeCompare` Romanian
- `newest` — by `created_at desc`

## Filter logic

```ts
function applyFilters(products: Product[], filters: Filters, query: string): Product[] {
  return products.filter(p => {
    if (filters.brand.length > 0 && !filters.brand.includes(p.brand)) return false;
    if (filters.family.length > 0 && !filters.family.includes(p.family)) return false;
    if (filters.gender) {
      // The schema currently only has `products.gender_neutral: boolean`.
      // There is no explicit male/female field. Filter logic:
      //   gender === 'unisex'  → only products with gender_neutral === true
      //   gender === 'male' / 'female' → only products with gender_neutral === false
      //                                  (best-effort; the underlying data does not distinguish
      //                                   male vs female, so both options return the same set)
      //   gender === 'all' (or unset) → no filter applied
      // This preserves the existing Shop behavior. A schema field for explicit gender
      // would be a separate sub-project; out of scope for Phase 2 Shop.
      if (filters.gender === 'unisex' && !p.gender_neutral) return false;
      if ((filters.gender === 'male' || filters.gender === 'female') && p.gender_neutral) return false;
    }
    if (filters.inStock && p.stock_volume <= 0) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}
```

## Brands view

### Layout

```
Produse · Branduri
Magazin
84 branduri

[search input — caută brand...]

A
─────────
[BrandCard] [BrandCard] [BrandCard] [BrandCard]

C
─────────
[BrandCard] [BrandCard]

D
─────────
…
```

### Composition

- Search input at the top (live-filters across all sections)
- Sections grouped by first letter of brand name
- Each section: `text-h2 md:text-h2-md font-medium text-text-strong mb-6` heading + 4-col card grid
- Section gap: 64px (`mb-16`)

```tsx
<section className="max-w-[1280px] mx-auto px-... py-12">
  <Input
    placeholder="Caută brand..."
    value={brandQuery}
    onChange={(e) => setBrandQuery(e.target.value)}
    className="max-w-md mb-12"
  />
  {sortedLetters.map(letter => (
    <section key={letter} className="mb-16">
      <p className="text-h2 md:text-h2-md font-medium text-text-strong mb-6">
        {letter}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {brandsByLetter[letter].map(b => <BrandCard key={b} name={b} />)}
      </div>
    </section>
  ))}
  {sortedLetters.length === 0 && (
    <p className="text-body text-text-muted text-center py-16">
      Niciun brand pentru "{brandQuery}".
    </p>
  )}
</section>
```

### Click behavior

`<BrandCard>` click navigates to `/shop?brand=<encoded-name>` (Products view, filtered by that brand). The view toggle in the header automatically reflects "Produse" as active.

## Edge cases & states

| Case | Behavior |
|---|---|
| Products loading | 12 ProductCard skeletons (`animate-shimmer`) in the grid. Sidebar visible but disabled. |
| 0 products match filters | Centered empty state below toolbar: `text-h3 "Niciun produs nu corespunde filtrelor."` + ghost button `Șterge filtrele`. Sidebar stays visible. |
| 0 products in DB entirely | `text-h3 "Catalogul este momentan gol."` — no clear-filters button (nothing to clear). |
| Brand search returns 0 brands (Brands view) | `text-body text-text-muted text-center py-16` `Niciun brand pentru "<query>"`. |
| User toggles between Products and Brands view | Filters preserved in URL but only Products view applies them. Brands view ignores `brand=` etc. |
| User clicks a brand card from Brands view | Navigate to `/shop?brand=<name>` (Products view) |
| `q` query matches both brand name and product name | Both included in results |
| User hits Load more | `setVisibleCount(c => c + 24)` — no URL change |
| User changes filter while load-more has been used | `visibleCount` resets to 24 |
| User changes sort while load-more has been used | `visibleCount` resets to 24 |
| Reduced motion | Sheet enter/exit collapses to 100ms; chip removals are instant |

## Functionality preservation

Audit items 1–10 (Product & shopping):

| # | Feature | Preserved? |
|---|---|---|
| 1 | Browse all products in grid | ✅ |
| 2 | Switch to list view | ✅ (Q3 a — kept) |
| 3 | Filter products by brand (multi-select) | ✅ |
| 4 | Filter products by family (multi-select) | ✅ |
| 5 | Filter products by gender (radio) | ✅ |
| 6 | Search products by name or brand | ✅ (in-page input + header overlay both work) |
| 7 | Sort products | ✅ (5 original + new `În stoc primele` = 6) |
| 8 | Paginate through results | ❌ Replaced by Load-more (Q3 y) |
| 9 | Browse brands alphabetically | ✅ |
| 10 | Search brands by name | ✅ |

Intentional regressions:
- Pagination → Load-more (acknowledged as a UX change, not a feature loss)
- A-Z jump strip ❌
- Card vs compact toggle ❌ (single card style on Brands view)
- Ctrl+K / "/" for in-page brand search ❌ (header overlay handles ⌘K globally from Phase 1)

## Forward compatibility

- **Price range filter (future):** A new section in `<FilterSidebar>` between Familie and Gen. Add `priceMin` / `priceMax` to URL state.
- **Tag-based filtering (future):** Same pattern, new section.
- **Saved searches (future):** Persist URL state to localStorage with a name; out of scope.
- **i18n (sub-project A):** All Romanian strings (`Brand`, `Familie`, `Gen`, `Disponibilitate`, `Doar produse în stoc`, `Recomandate`, `În stoc primele`, `Preț ↑/↓`, `Nume A-Z`, `Cele mai noi`, `Magazin`, `Branduri`, `Produse`, `Vezi toate`, `Vezi mai puțin`, `Filtre`, `Aplică`, `Șterge filtrele`, `Șterge toate`, `Niciun produs nu corespunde filtrelor`, `Catalogul este momentan gol`, `Niciun brand pentru`, `Încarcă mai multe`) live as inline JSX strings — they become the swap points when sub-project A resumes.

## Out of scope / deferred

- Server-side filtering / pagination (current implementation is client-side; products dataset is small enough)
- Saved filter sets / "favorites" UX
- Visual filter for color / scent intensity (would need data we don't have)
- Compare-products feature
- A/B testing infrastructure
- Analytics events on filter usage
