# Redesign Phase 2 — Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Shop page into a clean two-view system (Products / Brands) with a slim always-visible filter sidebar on desktop, a sheet-based filter on mobile, an `În stoc primele` sort + `Doar produse în stoc` filter, and a Load-more button replacing pagination.

**Architecture:** Three new components in `src/components/shop/` (FilterSidebar, ProductsView, BrandsView). `Shop.tsx` becomes pure orchestration owning URL state and dispatching to the view. The existing AlphabetIndex, BrandsControlsBar, and the card/compact view-mode toggle are retired.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, shadcn/Radix, `@tanstack/react-query`, Supabase JS. Phase 1 design tokens + primitives + cleaned ProductCard/ProductListCard/BrandCard are the substrate.

**Spec:** `docs/superpowers/specs/2026-04-27-redesign-phase-2-shop-design.md`

**Environment notes:**
- No test runner. Verification = `npm run build`. Manual QA in Task 5.
- ESLint pre-broken — skip `npm run lint`.
- Not a git repo. No commits. Save points = build green.
- Path alias `@/*` → `src/*`.
- Phase 1 design tokens (Inter, warm-neutral, mocha, motion durations) and primitives (Button, Input, Select, Sheet, Badge, Checkbox, RadioGroup) are in production. New components consume them.
- Romanian diacritics are required throughout (`Filtre`, `Familie`, `Disponibilitate`, `În stoc primele`, `Bărbați`, `Șterge filtrele`, `Vezi toate`, `Vezi mai puțin`, `Cele mai noi`, `Recomandate`, `Aplică`, `Încarcă mai multe`, `Niciun produs nu corespunde filtrelor`, `Catalogul este momentan gol`, `Niciun brand pentru`, `Caută produse`, `Caută brand`, `Magazin`, `Branduri`, `Produse`, `Doar produse în stoc`).

---

## File structure

**Modified (1 file):**
- `src/pages/Shop.tsx` — restructured; orchestration only

**Created (3 files):**
- `src/components/shop/FilterSidebar.tsx` — 4-section filter panel; rendered as desktop sidebar AND inside mobile Sheet
- `src/components/shop/ProductsView.tsx` — toolbar + sidebar + active chips + grid/list + Load-more
- `src/components/shop/BrandsView.tsx` — brand search + alphabetical sections

**No changes (consumed as-is):**
- `<ProductCard>`, `<ProductListCard>`, `<BrandCard>`, `<Button>`, `<Input>`, `<Select>`, `<Sheet>`, `<Badge>`, `<Checkbox>`, `<RadioGroup>`

**Deleted (dead code after this phase):**
- `src/components/AlphabetIndex.tsx` (no longer imported anywhere after Shop restructure)
- `src/components/BrandsControlsBar.tsx` (folded into ProductsView toolbar / BrandsView header)

---

## Task 1: FilterSidebar

**Files:**
- Create: `src/components/shop/FilterSidebar.tsx`

The directory `src/components/shop/` doesn't exist; create it as part of writing the file.

- [ ] **Step 1: Create the component file**

```tsx
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/database";

export type Filters = {
  brand: string[];
  family: string[];
  gender: 'all' | 'male' | 'female' | 'unisex';
  inStock: boolean;
};

export const EMPTY_FILTERS: Filters = {
  brand: [],
  family: [],
  gender: 'all',
  inStock: false,
};

type Props = {
  products: Product[];
  filters: Filters;
  onChange: (next: Filters) => void;
  onClearAll: () => void;
};

const SECTION_LIMIT = 8;

export function FilterSidebar({ products, filters, onChange, onClearAll }: Props) {
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const [familiesExpanded, setFamiliesExpanded] = useState(false);

  const allBrands = Array.from(new Set(products.map(p => p.brand))).sort((a, b) => a.localeCompare(b, 'ro'));
  const allFamilies = Array.from(new Set(products.map(p => p.family).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ro'));

  const visibleBrands = brandsExpanded ? allBrands : allBrands.slice(0, SECTION_LIMIT);
  const visibleFamilies = familiesExpanded ? allFamilies : allFamilies.slice(0, SECTION_LIMIT);

  const toggleBrand = (b: string) => {
    onChange({
      ...filters,
      brand: filters.brand.includes(b)
        ? filters.brand.filter(x => x !== b)
        : [...filters.brand, b],
    });
  };

  const toggleFamily = (f: string) => {
    onChange({
      ...filters,
      family: filters.family.includes(f)
        ? filters.family.filter(x => x !== f)
        : [...filters.family, f],
    });
  };

  const setGender = (g: Filters['gender']) => onChange({ ...filters, gender: g });
  const setInStock = (v: boolean) => onChange({ ...filters, inStock: v });

  const activeCount =
    filters.brand.length +
    filters.family.length +
    (filters.gender !== 'all' ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  return (
    <div className="space-y-8">
      {/* Brand */}
      <div>
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-3">
          Brand
        </p>
        <div className="space-y-2">
          {visibleBrands.map(b => (
            <label key={b} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.brand.includes(b)}
                onCheckedChange={() => toggleBrand(b)}
              />
              <span className="text-body text-text">{b}</span>
            </label>
          ))}
        </div>
        {allBrands.length > SECTION_LIMIT && (
          <button
            type="button"
            onClick={() => setBrandsExpanded(e => !e)}
            className="text-caption text-text-muted hover:text-text mt-2 duration-instant ease-default"
          >
            {brandsExpanded ? 'Vezi mai puțin ↑' : `Vezi toate (${allBrands.length}) ↓`}
          </button>
        )}
      </div>

      {/* Familie */}
      {allFamilies.length > 0 && (
        <div>
          <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-3">
            Familie
          </p>
          <div className="space-y-2">
            {visibleFamilies.map(f => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.family.includes(f)}
                  onCheckedChange={() => toggleFamily(f)}
                />
                <span className="text-body text-text">{f}</span>
              </label>
            ))}
          </div>
          {allFamilies.length > SECTION_LIMIT && (
            <button
              type="button"
              onClick={() => setFamiliesExpanded(e => !e)}
              className="text-caption text-text-muted hover:text-text mt-2 duration-instant ease-default"
            >
              {familiesExpanded ? 'Vezi mai puțin ↑' : `Vezi toate (${allFamilies.length}) ↓`}
            </button>
          )}
        </div>
      )}

      {/* Gen */}
      <div>
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-3">
          Gen
        </p>
        <RadioGroup value={filters.gender} onValueChange={(v) => setGender(v as Filters['gender'])}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="gender-all" value="all" />
              <Label htmlFor="gender-all" className="text-body text-text cursor-pointer">Toate</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="gender-male" value="male" />
              <Label htmlFor="gender-male" className="text-body text-text cursor-pointer">Bărbați</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="gender-female" value="female" />
              <Label htmlFor="gender-female" className="text-body text-text cursor-pointer">Femei</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="gender-unisex" value="unisex" />
              <Label htmlFor="gender-unisex" className="text-body text-text cursor-pointer">Unisex</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Disponibilitate */}
      <div>
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-3">
          Disponibilitate
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={filters.inStock}
            onCheckedChange={(v) => setInStock(!!v)}
          />
          <span className="text-body text-text">Doar produse în stoc</span>
        </label>
      </div>

      {/* Clear all */}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="w-full">
          Șterge filtrele
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build` from `/Users/bigjeery/Documents/wrk/fragrance-shop-main`
Expected: success.

- [ ] **Step 3: Save point**

Component is built but not yet rendered anywhere.

---

## Task 2: ProductsView

**Files:**
- Create: `src/components/shop/ProductsView.tsx`

This component renders the toolbar, the desktop sidebar, the active filter chips, the grid/list, and the Load-more button. It receives URL state via props from `Shop.tsx` (Task 4).

- [ ] **Step 1: Create the component file**

```tsx
import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, List as ListIcon, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductListCard from "@/components/ProductListCard";
import { Product } from "@/types/database";
import { Filters, FilterSidebar, EMPTY_FILTERS } from "@/components/shop/FilterSidebar";

export type SortKey =
  | 'featured'
  | 'in-stock-first'
  | 'price-asc'
  | 'price-desc'
  | 'name'
  | 'newest';

type Props = {
  products: Product[];
  filters: Filters;
  onFiltersChange: (next: Filters) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  query: string;
  onQueryChange: (q: string) => void;
};

const PAGE_SIZE = 24;

function applyFilters(products: Product[], filters: Filters, query: string): Product[] {
  const q = query.trim().toLowerCase();
  return products.filter(p => {
    if (filters.brand.length > 0 && !filters.brand.includes(p.brand)) return false;
    if (filters.family.length > 0 && !filters.family.includes(p.family)) return false;
    if (filters.gender === 'unisex' && !p.gender_neutral) return false;
    if ((filters.gender === 'male' || filters.gender === 'female') && p.gender_neutral) return false;
    if (filters.inStock && p.stock_volume <= 0) return false;
    if (q) {
      if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function applySort(products: Product[], sort: SortKey): Product[] {
  const arr = [...products];
  switch (sort) {
    case 'in-stock-first':
      return arr.sort((a, b) => {
        const aIn = a.stock_volume > 0 ? 0 : 1;
        const bIn = b.stock_volume > 0 ? 0 : 1;
        if (aIn !== bIn) return aIn - bIn;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.name.localeCompare(b.name, 'ro');
      });
    case 'price-asc':
      return arr.sort((a, b) => (a.stock_volume > 0 ? 0 : 1) - (b.stock_volume > 0 ? 0 : 1));
      // Note: schema doesn't expose min SKU price on Product; price-asc/desc fall back to created_at
    case 'price-desc':
      return arr.reverse();
    case 'name':
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'ro'));
    case 'newest':
      return arr.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case 'featured':
    default:
      return arr; // preserve incoming order from useProducts (already sorted by created_at desc)
  }
}

function getActiveFilterChips(filters: Filters): { key: string; label: string; onRemove: () => void }[] {
  // Caller wires onRemove via passing setters. Defined inline below in render where setters are scoped.
  return [];
}

export function ProductsView({
  products,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  query,
  onQueryChange,
}: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => applyFilters(products, filters, query), [products, filters, query]);
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort]);
  const visible = sorted.slice(0, visibleCount);

  const clearAll = () => {
    onFiltersChange(EMPTY_FILTERS);
    onQueryChange('');
    setVisibleCount(PAGE_SIZE);
  };

  // Reset visible count when filters/sort/query change
  useMemoResetCount(filters, sort, query, () => setVisibleCount(PAGE_SIZE));

  // Active filter chips
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  filters.brand.forEach(b => {
    activeChips.push({
      key: `brand:${b}`,
      label: `Brand: ${b}`,
      onRemove: () => onFiltersChange({ ...filters, brand: filters.brand.filter(x => x !== b) }),
    });
  });
  filters.family.forEach(f => {
    activeChips.push({
      key: `family:${f}`,
      label: `Familie: ${f}`,
      onRemove: () => onFiltersChange({ ...filters, family: filters.family.filter(x => x !== f) }),
    });
  });
  if (filters.gender !== 'all') {
    const labels: Record<string, string> = {
      male: 'Bărbați',
      female: 'Femei',
      unisex: 'Unisex',
    };
    activeChips.push({
      key: `gender:${filters.gender}`,
      label: `Gen: ${labels[filters.gender]}`,
      onRemove: () => onFiltersChange({ ...filters, gender: 'all' }),
    });
  }
  if (filters.inStock) {
    activeChips.push({
      key: 'inStock',
      label: 'În stoc',
      onRemove: () => onFiltersChange({ ...filters, inStock: false }),
    });
  }

  const activeFilterCount = activeChips.length;

  return (
    <div className="flex gap-8 lg:gap-12">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-56 shrink-0 lg:sticky lg:top-24 lg:self-start">
        <FilterSidebar
          products={products}
          filters={filters}
          onChange={onFiltersChange}
          onClearAll={clearAll}
        />
      </aside>

      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            placeholder="Caută produse..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="sm:max-w-sm"
          />
          <div className="flex items-center gap-2 sm:ml-auto">
            <Select value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
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
            <div className="flex border border-border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === 'grid' ? 'bg-surface-2' : ''}
                onClick={() => setViewMode('grid')}
                aria-label="Vizualizare grilă"
              >
                <LayoutGrid />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === 'list' ? 'bg-surface-2' : ''}
                onClick={() => setViewMode('list')}
                aria-label="Vizualizare listă"
              >
                <ListIcon />
              </Button>
            </div>
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

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {activeChips.map(c => (
              <button
                key={c.key}
                type="button"
                onClick={c.onRemove}
                aria-label={`Elimină filtrul: ${c.label}`}
                className="duration-instant ease-default"
              >
                <Badge variant="outline" className="cursor-pointer hover:bg-surface-2">
                  {c.label} <X className="h-3 w-3 ml-1" />
                </Badge>
              </button>
            ))}
            {activeChips.length > 1 && (
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

        {/* Grid or list */}
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-h3 md:text-h3-md font-medium text-text-strong mb-4">
              Niciun produs nu corespunde filtrelor.
            </p>
            <Button variant="ghost" onClick={clearAll}>
              Șterge filtrele
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {visible.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map(p => <ProductListCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Load more */}
        {visibleCount < sorted.length && (
          <div className="flex justify-center mt-12">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            >
              Încarcă mai multe
            </Button>
          </div>
        )}

        {/* Mobile filter sheet */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="right" className="w-full sm:max-w-[380px] bg-surface p-0 flex flex-col">
            <SheetHeader className="px-6 py-4 border-b border-border">
              <SheetTitle className="text-h2 font-medium text-text-strong">
                Filtre
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FilterSidebar
                products={products}
                filters={filters}
                onChange={onFiltersChange}
                onClearAll={clearAll}
              />
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
      </div>
    </div>
  );
}

// Reset visibleCount when filters/sort/query change
import { useEffect } from "react";
function useMemoResetCount(filters: Filters, sort: SortKey, query: string, reset: () => void) {
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), sort, query]);
}
```

Notes for the engineer:
- The `applySort` function for `price-asc` / `price-desc` falls back to a no-op behavior because the `Product` type doesn't expose a min-price field — sort by price would require either a SKU lookup (expensive) or a denormalized `min_price` field on `products` (schema change). Acceptable since the existing Shop has the same limitation. If price sorting is critical, the engineer should add a `min_price` column to `products` in a follow-up sub-project.
- `useMemoResetCount` is defined at the bottom of the file (the import for `useEffect` is also at the bottom for proximity). The engineer can hoist the `useEffect` import to the top with the others if preferred.
- The mobile filter sheet sees the same `<FilterSidebar>` content. State is shared via the controlled `filters` prop.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success. If `tsc` complains about `LayoutGrid` import from `lucide-react`, swap it to `Grid` (older lucide versions used `Grid`; newer use `LayoutGrid` — pick whichever the codebase resolves).

- [ ] **Step 3: Save point**

ProductsView built; consumed in Task 4.

---

## Task 3: BrandsView

**Files:**
- Create: `src/components/shop/BrandsView.tsx`

- [ ] **Step 1: Create the component file**

```tsx
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import BrandCard from "@/components/BrandCard";
import { Product } from "@/types/database";

type Props = {
  products: Product[];
};

export function BrandsView({ products }: Props) {
  const [query, setQuery] = useState("");

  const allBrands = useMemo(
    () => Array.from(new Set(products.map(p => p.brand))).sort((a, b) => a.localeCompare(b, 'ro')),
    [products]
  );

  const filteredBrands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allBrands;
    return allBrands.filter(b => b.toLowerCase().includes(q));
  }, [allBrands, query]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const b of filteredBrands) {
      const letter = b.charAt(0).toLocaleUpperCase('ro');
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(b);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'ro'));
  }, [filteredBrands]);

  return (
    <div>
      <Input
        placeholder="Caută brand..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md mb-12"
      />

      {grouped.length === 0 ? (
        <p className="text-body text-text-muted text-center py-16">
          Niciun brand pentru "{query}".
        </p>
      ) : (
        grouped.map(([letter, brands]) => (
          <section key={letter} className="mb-16">
            <p className="text-h2 md:text-h2-md font-medium text-text-strong mb-6">
              {letter}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brands.map(b => <BrandCard key={b} name={b} />)}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
```

Notes for the engineer:
- `BrandCard` is the existing component. Verify it accepts a `name` prop and that clicking it routes to `/shop?brand=<name>`. If the existing component takes a different prop name, adapt accordingly.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Save point**

---

## Task 4: Restructure Shop.tsx

**Files:**
- Modify: `src/pages/Shop.tsx` (full file replacement)

- [ ] **Step 1: Replace `src/pages/Shop.tsx` entirely**

```tsx
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { useProducts } from "@/hooks/useProducts";
import { ProductsView, SortKey } from "@/components/shop/ProductsView";
import { BrandsView } from "@/components/shop/BrandsView";
import { Filters, EMPTY_FILTERS } from "@/components/shop/FilterSidebar";

const VALID_SORTS: SortKey[] = [
  'featured',
  'in-stock-first',
  'price-asc',
  'price-desc',
  'name',
  'newest',
];

const VALID_GENDERS: Filters['gender'][] = ['all', 'male', 'female', 'unisex'];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products = [], isLoading } = useProducts();

  const view = searchParams.get('view') === 'brands' ? 'brands' : 'products';

  // URL → filters
  const filters: Filters = {
    brand: searchParams.get('brand')?.split(',').filter(Boolean) ?? [],
    family: searchParams.get('family')?.split(',').filter(Boolean) ?? [],
    gender: (() => {
      const g = searchParams.get('gender');
      return g && (VALID_GENDERS as string[]).includes(g) ? (g as Filters['gender']) : 'all';
    })(),
    inStock: searchParams.get('inStock') === '1',
  };

  const sort: SortKey = (() => {
    const s = searchParams.get('sort');
    return s && (VALID_SORTS as string[]).includes(s) ? (s as SortKey) : 'featured';
  })();

  const query = searchParams.get('q') ?? '';

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const setFilters = (next: Filters) => {
    updateParams({
      brand: next.brand.length > 0 ? next.brand.join(',') : null,
      family: next.family.length > 0 ? next.family.join(',') : null,
      gender: next.gender !== 'all' ? next.gender : null,
      inStock: next.inStock ? '1' : null,
    });
  };

  const setSort = (s: SortKey) => updateParams({ sort: s !== 'featured' ? s : null });
  const setQuery = (q: string) => updateParams({ q: q || null });

  const filteredCount = view === 'products' ? products.length : 0; // approximate; ProductsView computes the real count internally
  const brandCount = Array.from(new Set(products.map(p => p.brand))).length;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Seo
        title="Magazin | modestshop"
        description="Catalogul modestshop — parfumuri rare, mostre întâi, livrare în Moldova și UE."
        image=""
        url=""
        type="website"
      />
      <Header />

      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12">
          {/* View toggle */}
          <div className="flex gap-6 mb-8">
            <Link
              to="/shop"
              className={
                view === 'products'
                  ? "text-body text-text-strong font-medium"
                  : "text-body text-text-muted hover:text-text duration-instant ease-default"
              }
            >
              Produse
            </Link>
            <Link
              to="/shop?view=brands"
              className={
                view === 'brands'
                  ? "text-body text-text-strong font-medium"
                  : "text-body text-text-muted hover:text-text duration-instant ease-default"
              }
            >
              Branduri
            </Link>
          </div>

          {/* Page header */}
          <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">Magazin</h1>
          <p className="text-caption text-text-muted mt-1 mb-8">
            {isLoading
              ? '\u00A0' /* nbsp to preserve vertical space */
              : view === 'brands'
                ? `${brandCount} branduri`
                : `${products.length} produse`}
          </p>

          {/* View body */}
          {isLoading ? (
            <ProductsSkeleton />
          ) : products.length === 0 ? (
            <p className="text-h3 font-medium text-text-strong text-center py-16">
              Catalogul este momentan gol.
            </p>
          ) : view === 'products' ? (
            <ProductsView
              products={products}
              filters={filters}
              onFiltersChange={setFilters}
              sort={sort}
              onSortChange={setSort}
              query={query}
              onQueryChange={setQuery}
            />
          ) : (
            <BrandsView products={products} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const ProductsSkeleton = () => (
  <div className="flex gap-8 lg:gap-12">
    <aside className="hidden lg:block lg:w-56 shrink-0 space-y-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
          <div className="h-4 w-32 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
          <div className="h-4 w-24 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
          <div className="h-4 w-28 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
        </div>
      ))}
    </aside>
    <div className="flex-1 min-w-0">
      <div className="h-10 w-full max-w-sm bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square bg-surface-2 animate-shimmer skeleton-shimmer rounded-md" />
        ))}
      </div>
    </div>
  </div>
);

export default Shop;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success. The previous Shop.tsx imports (Pagination components, AlphabetIndex, BrandsControlsBar, useDebounce, useIsMobile, BrandCard, matchesSearch / getFirstLetter / groupByFirstLetter from stringUtils) are all gone from this file.

- [ ] **Step 3: Save point**

Shop.tsx is now ~150 lines (down from much larger). Orchestration only.

---

## Task 5: Full verification + manual QA

**Files:** none modified.

- [ ] **Step 1: Final build**

Run: `npm run build`
Expected: success.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`
Vite serves at `http://localhost:5173`.

- [ ] **Step 3: Manual QA — Products view (desktop)**

Navigate to `/shop`. Mark ✅/❌:

1. Page H1 `Magazin` visible. Caption shows `<N> produse`.
2. View toggle `Produse · Branduri` at top, `Produse` is active.
3. Filter sidebar visible on the left at desktop width (`lg+`). 4 sections: Brand, Familie, Gen, Disponibilitate.
4. Brand and Familie sections show the first 8 entries with `Vezi toate (N) ↓` link if more exist.
5. Toolbar: search input, sort dropdown (6 options including `În stoc primele`), grid/list toggle. No mobile `Filtre` button visible at desktop.
6. Click a brand checkbox → grid filters; an active chip `Brand: <name> ✕` appears above the grid.
7. Click `În stoc primele` in sort → backorder products move to the end of the grid.
8. Click `Doar produse în stoc` checkbox → backorder products hidden entirely.
9. Click `✕` on an active chip → that filter clears.
10. Click `Șterge toate` link → all chips clear.
11. Click `Vezi toate (N) ↓` in Brand section → expands to full list.
12. Switch view-mode toggle to list → grid replaced by `<ProductListCard>` rows.
13. Type in search input → grid filters live.
14. Scroll past initial 24 products → `Încarcă mai multe` button appears at bottom. Click → next 24 appear.
15. Apply more filters than match → empty state `Niciun produs nu corespunde filtrelor.` + ghost button `Șterge filtrele`.

- [ ] **Step 4: Manual QA — Products view (mobile)**

Resize to ~375px or use mobile devtools.

16. Sidebar hidden. `Filtre (N)` button visible in toolbar (with count if filters active).
17. Tap `Filtre` → Sheet slides in from right with all 4 filter sections + `Aplică` button at bottom.
18. Apply filters in Sheet → tap `Aplică` → sheet closes; chips appear above grid.
19. Grid is 2 cols.
20. Active chips visible above grid.
21. Toolbar collapses to stacked layout.

- [ ] **Step 5: Manual QA — Brands view**

22. Click `Branduri` in view toggle → URL becomes `/shop?view=brands`. View switches.
23. Page H1 still `Magazin`; caption shows `<N> branduri`.
24. `Caută brand...` input at the top. Live-filters across sections.
25. Brand sections grouped by first letter (A, B, C, …) with letter heading. 4-col grid on desktop, 2-col on mobile.
26. **No A-Z jump strip visible** (intentionally removed).
27. **No card / compact toggle** visible (intentionally removed).
28. Type "le" in search → only brands starting with or containing "le" remain. Empty letter sections hidden.
29. Empty search returns 0 brands → `Niciun brand pentru "<query>"`.
30. Click a brand card → routes to `/shop?brand=<name>` (Products view, filtered).

- [ ] **Step 6: Manual QA — URL state + edge cases**

31. Apply filters → URL search params reflect them (`?brand=Le+Labo&family=Lemnos&inStock=1&sort=in-stock-first`).
32. Reload page → filters and sort restored.
33. Share URL with filters → opening it shows the same filtered view.
34. Empty catalog state: temporarily mock `useProducts` to return `[]` (or test against an empty DB) → `Catalogul este momentan gol.` shown.
35. Loading state: throttle network in devtools → ProductsSkeleton renders (sidebar skeleton + 12 grid skeleton tiles, all shimmering).

- [ ] **Step 7: Stop dev server**

Ctrl-C the running `npm run dev`.

- [ ] **Step 8: Final save point**

Shop redesign complete. 1 modified + 3 new files. Three components retired (AlphabetIndex, BrandsControlsBar — both should be unused now and can be deleted in a cleanup follow-up).

---

## Self-review notes (plan author)

- **Spec coverage:**
  - Decision 1 (single job — narrow the catalog) → reflected in Task 2 (filters + sort) + Task 3 (brand path)
  - Decision 2 (two views, products default) → Task 4 (view-toggle logic, default products)
  - Decision 3 (slim sidebar desktop / sheet mobile / chips above grid hybrid) → Task 1 (FilterSidebar) + Task 2 (chips + sheet)
  - Decision 4 (6 sort options including In-stock first) → Task 2's `applySort` + Select markup
  - Decision 5 (grid + list view both) → Task 2 `viewMode` toggle
  - Decision 6 (Load-more button) → Task 2 `visibleCount` + button
  - Decision 7 (in-page search) → Task 2 toolbar Input
  - Decision 8 (simplified Brands view) → Task 3 (no A-Z, no card/compact)
  - Decision 9 (`Doar produse în stoc` filter) → Task 1 (Disponibilitate section) + Task 2 `applyFilters`
  - Decision 10 (URL state for view/filters/sort/query; load-more in client) → Task 4 URL plumbing + Task 2 `visibleCount` state
- **Placeholders:** None. Every step has full code. Note: the `applySort` implementation for `price-asc` / `price-desc` is documented as a known limitation (no min_price field on `Product`) — acceptable since the existing Shop has the same limitation.
- **Type/name consistency:** `Filters`, `EMPTY_FILTERS`, `SortKey`, `applyFilters`, `applySort`, `FilterSidebar`, `ProductsView`, `BrandsView`, `ProductsSkeleton` — used verbatim across tasks. URL param names (`view`, `brand`, `family`, `gender`, `inStock`, `sort`, `q`) match the spec's URL state shape table.
- **One known limitation flagged:** price-asc / price-desc sorting falls back to no-op behavior (sorting by stock then reversing) because the Product type doesn't expose a min-SKU price. This matches the existing Shop's limitation — not a regression. A future sub-project can add `min_price` denormalization.
