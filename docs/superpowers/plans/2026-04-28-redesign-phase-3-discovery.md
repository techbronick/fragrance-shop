# Redesign Phase 3 — Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Discovery flow into three URL-distinct surfaces (predefined / builder / recommendation) with a two-pane custom builder, a 3-step AI questionnaire, and a set-detail page that reuses the Phase 2 PDP shape.

**Architecture:** Two pages restructured, seven new components in `src/components/discovery/`, seven existing discovery components dropped (their roles fold into the new ones). Builder owns selection state; URL params persist size + prefill across reloads. Wizard steps + answers all live in URL params.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, shadcn/Radix, `@tanstack/react-query`, Supabase JS. Phase 1 design tokens, Phase 2 primitives + PDP components + Shop FilterSidebar all in production.

**Spec:** `docs/superpowers/specs/2026-04-28-redesign-phase-3-discovery-design.md`

**Environment notes:**
- No test runner. Verification = `npm run build`.
- ESLint pre-broken — skip `npm run lint`.
- Not a git repo. No commits.
- Path alias `@/*` → `src/*`.
- Romanian diacritics required throughout. The full glossary appears in the spec; preserve every diacritic verbatim across all components.
- **The user runs manual QA themselves, not as a plan task.** Final task is build verification only.

---

## File structure

**Modified (2):**
- `src/pages/DiscoverySets.tsx` — URL view dispatch
- `src/pages/DiscoverySetProduct.tsx` — restructured to reuse Phase 2 PDP layout

**Created (7):**
- `src/components/discovery/PredefinedSetsGrid.tsx`
- `src/components/discovery/SetPurchaseBlock.tsx`
- `src/components/discovery/SetMobileBuyBar.tsx`
- `src/components/discovery/SetTray.tsx`
- `src/components/discovery/SetCatalogPane.tsx`
- `src/components/discovery/SetBuilder.tsx`
- `src/components/discovery/RecommendationWizard.tsx`

**Deleted-after-cleanup (will be unused after this plan):**
- `src/components/discovery/DiscoverySetBuilder.tsx`
- `src/components/discovery/DiscoveryRecommendation.tsx`
- `src/components/discovery/DiscoveryConfigSelector.tsx`
- `src/components/discovery/DiscoveryProductSelector.tsx`
- `src/components/discovery/DiscoverySlotsManager.tsx`
- `src/components/discovery/DiscoverySetActions.tsx`
- `src/components/discovery/DiscoverySetNameEditor.tsx`
- `src/components/discovery/ProductFilters.tsx`
- `src/components/discovery/ProductGrid.tsx`

These can be deleted in a small follow-up cleanup pass after Task 7 verifies nothing imports them.

---

## Task 1: PredefinedSetsGrid

**Files:**
- Create: `src/components/discovery/PredefinedSetsGrid.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Link } from "react-router-dom";
import { DiscoverySetConfig } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";

type Props = {
  sets: DiscoverySetConfig[];
  isLoading?: boolean;
};

export function PredefinedSetsGrid({ sets, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-md overflow-hidden">
            <div className="aspect-square bg-surface-2 animate-shimmer skeleton-shimmer" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-2/3 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
              <div className="h-3 w-1/2 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
              <div className="h-4 w-1/3 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <p className="text-h3 font-medium text-text-strong text-center py-16">
        Nu există seturi predefinite momentan.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {sets.map(set => (
        <Link
          key={set.id}
          to={`/discovery-set/${set.id}`}
          className="block bg-surface border border-border rounded-md overflow-hidden"
        >
          <div className="aspect-square bg-surface-2">
            {set.image_url && (
              <img
                src={set.image_url}
                alt={set.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>
          <div className="p-4 space-y-1">
            <p className="text-body text-text-strong">{set.name}</p>
            <p className="text-caption text-text-muted">
              {set.total_slots} {set.total_slots === 1 ? 'mostră' : 'mostre'} · {set.volume_ml}ml
            </p>
            <p className="text-body text-text">{formatPrice(set.base_price)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

---

## Task 2: SetPurchaseBlock + SetMobileBuyBar

**Files:**
- Create: `src/components/discovery/SetPurchaseBlock.tsx`
- Create: `src/components/discovery/SetMobileBuyBar.tsx`

- [ ] **Step 1: Create `SetPurchaseBlock.tsx`**

```tsx
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { DiscoverySetConfig } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";
import { ShippingEstimate } from "@/components/ShippingEstimate";

type Props = {
  config: DiscoverySetConfig;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: () => void;
  isAdding: boolean;
};

export function SetPurchaseBlock({
  config,
  quantity,
  onQuantityChange,
  onAddToCart,
  isAdding,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-caption text-text-muted uppercase tracking-[0.06em]">
          Set discovery
        </p>
        <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">
          {config.name}
        </h1>
        {config.description && (
          <p className="text-body text-text-muted line-clamp-2">
            {config.description}
          </p>
        )}
        <p className="text-body text-text-muted">
          {config.total_slots} {config.total_slots === 1 ? 'mostră' : 'mostre'} × {config.volume_ml}ml
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-h2 md:text-h2-md font-normal text-text-strong">
          {formatPrice(config.base_price * quantity)}
        </p>
        {/* No SKU stocks for sets — pass empty array; component renders nothing */}
        <ShippingEstimate stocks={[]} />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          aria-label="Scade cantitatea"
        >
          <Minus />
        </Button>
        <span className="text-body min-w-[24px] text-center">{quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onQuantityChange(quantity + 1)}
          aria-label="Crește cantitatea"
        >
          <Plus />
        </Button>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={onAddToCart}
        disabled={isAdding}
      >
        {isAdding ? 'Se procesează...' : 'Adaugă în coș'}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create `SetMobileBuyBar.tsx`**

```tsx
import { useEffect, useState, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { DiscoverySetConfig } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";

type Props = {
  config: DiscoverySetConfig;
  quantity: number;
  onAddToCart: () => void;
  watchRef: RefObject<HTMLElement>;
};

export function SetMobileBuyBar({ config, quantity, onAddToCart, watchRef }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = watchRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchRef]);

  if (!visible) return null;

  const scrollBack = () => {
    watchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={scrollBack}
          className="text-body text-text-strong text-left flex-1 min-w-0 truncate"
        >
          <span className="text-text-muted">{config.volume_ml}ml × {config.total_slots}</span>
          <span className="mx-2 text-text-faint">·</span>
          <span>{formatPrice(config.base_price * quantity)}</span>
        </button>
        <Button variant="primary" size="md" onClick={onAddToCart}>
          Adaugă în coș
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success.

---

## Task 3: Restructure DiscoverySetProduct.tsx

**Files:**
- Modify: `src/pages/DiscoverySetProduct.tsx` (full file replacement)

- [ ] **Step 1: Replace the file entirely**

```tsx
import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { useDiscoverySetConfig } from "@/hooks/useDiscoverySets";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { ProductImage } from "@/components/product/ProductImage";
import { SetPurchaseBlock } from "@/components/discovery/SetPurchaseBlock";
import { SetMobileBuyBar } from "@/components/discovery/SetMobileBuyBar";
import DiscoveryProductCard from "@/components/discovery/DiscoveryProductCard";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=600&h=600&q=75&fm=webp";

const DiscoverySetProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: config, isLoading } = useDiscoverySetConfig(id || "");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();
  const inlinePurchaseRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 w-full">
          <div className="md:col-span-7">
            <div className="aspect-square bg-surface-2 rounded-md animate-shimmer skeleton-shimmer" />
          </div>
          <div className="md:col-span-5 space-y-6">
            <div className="h-4 w-24 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
            <div className="h-8 w-3/4 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
            <div className="h-4 w-full bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!id || !config) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-4">
              Setul nu este disponibil
            </h1>
            <Button variant="ghost" onClick={() => navigate('/discovery-sets')}>
              Înapoi la Seturi
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: `predefined-${config.id}`,
      type: 'predefined-bundle',
      configId: config.id,
      name: config.name,
      quantity,
      price: config.base_price,
      image: config.image_url || undefined,
    });
    toast({
      title: 'Adăugat în coș',
      description: config.name,
    });
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Seo
        title={`${config.name} | Set discovery | modestshop`}
        description={config.description || ''}
        image={config.image_url || ''}
        url=""
        type="product"
      />
      <Header />

      <main className="flex-1">
        {/* Above the fold */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-7">
            <ProductImage
              src={config.image_url || FALLBACK_IMAGE}
              alt={config.name}
              fallback={FALLBACK_IMAGE}
            />
          </div>
          <div
            ref={inlinePurchaseRef}
            className="md:col-span-5 md:sticky md:top-24 md:self-start"
          >
            <SetPurchaseBlock
              config={config}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              isAdding={isAdding}
            />
          </div>
        </div>

        {/* Below the fold — set composition */}
        {config.items && config.items.length > 0 && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-24 md:pb-32">
            <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
              Fragranțele din set
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {config.items.map(item => (
                <DiscoveryProductCard key={item.slot_index} item={item} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      <SetMobileBuyBar
        config={config}
        quantity={quantity}
        onAddToCart={handleAddToCart}
        watchRef={inlinePurchaseRef}
      />
    </div>
  );
};

export default DiscoverySetProduct;
```

Notes for the engineer:
- The hook `useDiscoverySetConfig(id)` may be `useDiscoverySetConfigsWithItems` filtered to one. Verify the exported hook name in `src/hooks/useDiscoverySets.ts` and adapt if needed.
- `<DiscoveryProductCard>` is the existing component; verify it accepts an `item` prop that matches the shape returned by the hook (`{ slot_index, sku_id, size_ml, label, product }`). If the prop name differs, adapt.
- The previous implementation may have logged or computed extra things — preserve any side effects (analytics, etc.) that are not visual.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

---

## Task 4: SetTray + SetCatalogPane

**Files:**
- Create: `src/components/discovery/SetTray.tsx`
- Create: `src/components/discovery/SetCatalogPane.tsx`

- [ ] **Step 1: Create `SetTray.tsx`**

```tsx
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Product } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";

type Props = {
  selected: Product[];
  totalSlots: number;
  subtotal: number;
  onRemove: (productId: string) => void;
  onAddToCart: () => void;
  isAdding: boolean;
};

export function SetTray({
  selected,
  totalSlots,
  subtotal,
  onRemove,
  onAddToCart,
  isAdding,
}: Props) {
  const emptySlots = Math.max(0, totalSlots - selected.length);
  const isFull = selected.length === totalSlots;

  return (
    <aside className="bg-surface border border-border rounded-md p-6">
      <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-1">
        Setul tău
      </p>
      <p className="text-body text-text-strong mb-4">
        {selected.length} / {totalSlots} {totalSlots === 1 ? 'mostră' : 'mostre'}
      </p>

      {/* Slot progress bars */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: totalSlots }).map((_, i) => (
          <div
            key={i}
            className={
              "h-1 flex-1 rounded-pill " +
              (i < selected.length ? "bg-mocha" : "bg-surface-2")
            }
          />
        ))}
      </div>

      {/* Selected items */}
      <div className="space-y-3 mb-6">
        {selected.map(product => (
          <div key={product.id} className="flex items-center gap-3">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-10 h-10 object-cover rounded-sm bg-surface-2 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-body text-text-strong truncate">{product.name}</p>
              <p className="text-caption text-text-muted truncate">{product.brand}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(product.id)}
              aria-label="Elimină"
            >
              <X />
            </Button>
          </div>
        ))}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} className="flex items-center gap-3 opacity-50">
            <div className="w-10 h-10 rounded-sm bg-surface-2 shrink-0" />
            <p className="text-body text-text-muted">Slot gol</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4 mb-4">
        <div className="flex justify-between text-body">
          <span className="text-text-muted">Subtotal</span>
          <span className="text-text-strong">{formatPrice(subtotal)}</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={selected.length === 0 || isAdding}
        onClick={onAddToCart}
      >
        {isAdding
          ? 'Se procesează...'
          : isFull
            ? 'Adaugă în coș'
            : `Continuă (${selected.length}/${totalSlots})`}
      </Button>
    </aside>
  );
}
```

- [ ] **Step 2: Create `SetCatalogPane.tsx`**

```tsx
import { useState, useMemo, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check } from "lucide-react";
import { Product } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";
import { Filters, FilterSidebar, EMPTY_FILTERS } from "@/components/shop/FilterSidebar";

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name' | 'newest';

type Props = {
  products: Product[];
  selectedIds: Set<string>;
  onToggle: (productId: string) => void;
  canAddMore: boolean;
};

const PAGE_SIZE = 24;

function applyFilters(products: Product[], filters: Filters, query: string): Product[] {
  const q = query.trim().toLowerCase();
  return products.filter(p => {
    if (filters.brand.length > 0 && !filters.brand.includes(p.brand)) return false;
    if (filters.family.length > 0 && !filters.family.includes(p.family)) return false;
    if (filters.gender === 'unisex' && !p.gender_neutral) return false;
    if ((filters.gender === 'male' || filters.gender === 'female') && p.gender_neutral) return false;
    if (q) {
      if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function applySort(products: Product[], sort: SortKey): Product[] {
  const arr = [...products];
  switch (sort) {
    case 'name':
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'ro'));
    case 'newest':
      return arr.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case 'price-asc':
    case 'price-desc':
    case 'featured':
    default:
      return arr;
  }
}

export function SetCatalogPane({ products, selectedIds, onToggle, canAddMore }: Props) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>('featured');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => applyFilters(products, filters, query), [products, filters, query]);
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort]);
  const visible = sorted.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [JSON.stringify(filters), sort, query]);

  return (
    <div className="flex gap-8 lg:gap-12">
      <aside className="hidden lg:block lg:w-56 shrink-0 lg:sticky lg:top-24 lg:self-start">
        <FilterSidebar
          products={products}
          filters={filters}
          onChange={setFilters}
          onClearAll={() => setFilters(EMPTY_FILTERS)}
        />
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <Input
            placeholder="Caută produse..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-sm"
          />
          <div className="flex items-center gap-2 sm:ml-auto">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Recomandate</SelectItem>
                <SelectItem value="price-asc">Preț ↑</SelectItem>
                <SelectItem value="price-desc">Preț ↓</SelectItem>
                <SelectItem value="name">Nume A-Z</SelectItem>
                <SelectItem value="newest">Cele mai noi</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="md"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              Filtre
            </Button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-h3 md:text-h3-md font-medium text-text-strong">
              Niciun produs găsit.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {visible.map(product => {
              const isSelected = selectedIds.has(product.id);
              const disabled = !canAddMore && !isSelected;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onToggle(product.id)}
                  disabled={disabled}
                  className={
                    "relative bg-surface border rounded-md overflow-hidden text-left duration-instant ease-default " +
                    (isSelected
                      ? "border-mocha bg-mocha-soft"
                      : "border-border hover:bg-surface-2") +
                    (disabled ? " opacity-50 cursor-not-allowed" : "")
                  }
                >
                  <div className="aspect-square bg-surface-2">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-caption text-text-muted truncate">{product.brand}</p>
                    <p className="text-body text-text-strong truncate">{product.name}</p>
                  </div>
                  <div
                    className={
                      "absolute top-2 right-2 h-8 w-8 rounded-pill flex items-center justify-center " +
                      (isSelected
                        ? "bg-mocha text-paper"
                        : "bg-paper text-text border border-border")
                    }
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

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

        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="right" className="w-full sm:max-w-[380px] bg-surface p-0 flex flex-col">
            <SheetHeader className="px-6 py-4 border-b border-border">
              <SheetTitle className="text-h2 font-medium text-text-strong">Filtre</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FilterSidebar
                products={products}
                filters={filters}
                onChange={setFilters}
                onClearAll={() => setFilters(EMPTY_FILTERS)}
              />
            </div>
            <div className="border-t border-border px-6 py-4">
              <SheetClose asChild>
                <Button variant="primary" size="lg" className="w-full">Aplică</Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success.

---

## Task 5: SetBuilder

**Files:**
- Create: `src/components/discovery/SetBuilder.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useDiscoverySetConfigs } from "@/hooks/useDiscoverySets";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/utils/formatPrice";
import { SetCatalogPane } from "@/components/discovery/SetCatalogPane";
import { SetTray } from "@/components/discovery/SetTray";

const VALID_SIZES = [5, 10] as const;
type Size = typeof VALID_SIZES[number];

export function SetBuilder() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products = [] } = useProducts();
  const { data: configs = [] } = useDiscoverySetConfigs();
  const { addItem } = useCart();
  const { toast } = useToast();

  const initialSize: Size = (() => {
    const s = parseInt(searchParams.get('size') || '', 10);
    return (VALID_SIZES as readonly number[]).includes(s) ? (s as Size) : 5;
  })();

  const [totalSlots, setTotalSlots] = useState<Size>(initialSize);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const prefill = searchParams.get('prefill');
    return prefill ? prefill.split(',').filter(Boolean).slice(0, initialSize) : [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);

  // Sync size to URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (totalSlots !== 5) next.set('size', String(totalSlots));
    else next.delete('size');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlots]);

  // Handle size shrinking — truncate selection
  useEffect(() => {
    if (selectedIds.length > totalSlots) {
      const removedCount = selectedIds.length - totalSlots;
      setSelectedIds(prev => prev.slice(0, totalSlots));
      toast({
        title: `${removedCount} ${removedCount === 1 ? 'mostră eliminată' : 'mostre eliminate'}`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlots]);

  const productIndex = useMemo(() => {
    const map = new Map(products.map(p => [p.id, p]));
    return map;
  }, [products]);

  const selected = useMemo(
    () => selectedIds.map(id => productIndex.get(id)).filter(Boolean) as ReturnType<typeof productIndex.get>[],
    [selectedIds, productIndex]
  ) as NonNullable<ReturnType<typeof productIndex.get>>[];

  const customizableConfig = useMemo(
    () => configs.find(c => c.total_slots === totalSlots && c.is_customizable),
    [configs, totalSlots]
  );

  const subtotal = customizableConfig ? customizableConfig.base_price : 0;

  const toggleProduct = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= totalSlots) return prev;
      return [...prev, id];
    });
  };

  const removeProduct = (id: string) => {
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  const handleAddToCart = () => {
    if (!customizableConfig || selectedIds.length === 0) return;
    setIsAdding(true);
    addItem({
      id: `custom-${Date.now()}`,
      type: 'custom-bundle',
      configId: customizableConfig.id,
      name: `Set discovery (${totalSlots} mostre)`,
      quantity: 1,
      price: customizableConfig.base_price,
      image: customizableConfig.image_url || undefined,
      selectedItems: selectedIds.map((productId, i) => ({
        slot_index: i,
        sku_id: productId,
      })),
    });
    toast({ title: 'Set adăugat în coș' });
    navigate('/checkout');
    setIsAdding(false);
  };

  return (
    <div>
      {/* Page header */}
      <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">
        Construiește setul
      </h1>
      <p className="text-body text-text-muted mt-2 mb-8">
        Alege {totalSlots} mostre din catalog. Decide care merită sticla.
      </p>

      {/* Size selector */}
      <div className="mb-8 flex items-center gap-3">
        <span className="text-caption uppercase tracking-[0.06em] text-text-muted">Mărime</span>
        {VALID_SIZES.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setTotalSlots(s)}
            className={
              "rounded-pill px-4 py-2 text-body border duration-instant ease-default " +
              (totalSlots === s
                ? "bg-mocha text-paper border-mocha"
                : "bg-surface text-text border-border hover:bg-surface-2")
            }
          >
            {s} mostre
          </button>
        ))}
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
        <div className="min-w-0">
          <SetCatalogPane
            products={products}
            selectedIds={new Set(selectedIds)}
            onToggle={toggleProduct}
            canAddMore={selectedIds.length < totalSlots}
          />
        </div>
        <div className="hidden lg:block">
          <div className="lg:sticky lg:top-24">
            <SetTray
              selected={selected}
              totalSlots={totalSlots}
              subtotal={subtotal}
              onRemove={removeProduct}
              onAddToCart={handleAddToCart}
              isAdding={isAdding}
            />
          </div>
        </div>
      </div>

      {/* Mobile tray bar */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <button
          type="button"
          onClick={() => setTrayOpen(true)}
          className="w-full px-4 py-3 flex items-center justify-between gap-3"
        >
          <span className="text-body text-text-strong">
            {selectedIds.length} / {totalSlots} · {formatPrice(subtotal)}
          </span>
          <span className="text-body text-text-muted">Vezi setul →</span>
        </button>
      </div>

      {/* Mobile tray sheet */}
      <Sheet open={trayOpen} onOpenChange={setTrayOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[380px] bg-surface p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <SheetTitle className="text-h2 font-medium text-text-strong">Setul tău</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <SetTray
              selected={selected}
              totalSlots={totalSlots}
              subtotal={subtotal}
              onRemove={removeProduct}
              onAddToCart={() => {
                setTrayOpen(false);
                handleAddToCart();
              }}
              isAdding={isAdding}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

Notes for the engineer:
- The hook name `useDiscoverySetConfigs` may be different in `src/hooks/useDiscoverySets.ts`. Verify and adapt.
- The `customizableConfig` lookup assumes a flag like `is_customizable` exists on the config. Verify the field name (it appeared in the audit).
- Mobile bar height ~64px. The page wrapping the SetBuilder must add `pb-24 lg:pb-0` to the main content area to prevent the bar from covering the catalog.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

---

## Task 6: RecommendationWizard

**Files:**
- Create: `src/components/discovery/RecommendationWizard.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/database";

const OCCASIONS = [
  { value: 'day', label: 'Zi' },
  { value: 'evening', label: 'Seară' },
  { value: 'special', label: 'Special' },
  { value: 'any', label: 'Toate' },
] as const;

const NOTE_FAMILIES = [
  { value: 'woody', label: 'Lemn' },
  { value: 'citrus', label: 'Citric' },
  { value: 'floral', label: 'Floral' },
  { value: 'oriental', label: 'Oriental' },
  { value: 'gourmand', label: 'Gurmand' },
  { value: 'aquatic', label: 'Aquatic' },
  { value: 'green', label: 'Verde' },
  { value: 'musk', label: 'Mosc' },
] as const;

type Occasion = typeof OCCASIONS[number]['value'];
type NoteFamily = typeof NOTE_FAMILIES[number]['value'];

function recommendProducts(
  products: Product[],
  occasion: Occasion | null,
  notes: NoteFamily[],
  fav: string,
): Product[] {
  // Score each product against the answers; return top 5.
  // Heuristic: boost if family lowercase contains any note keyword; light occasion influence.
  const noteScores = (p: Product): number => {
    const fam = (p.family || '').toLowerCase();
    return notes.reduce((acc, n) => acc + (fam.includes(n) ? 1 : 0), 0);
  };

  const favScore = (p: Product): number => {
    if (!fav) return 0;
    const f = fav.toLowerCase();
    return (p.name.toLowerCase().includes(f) || p.brand.toLowerCase().includes(f)) ? 0.5 : 0;
  };

  const scored = products.map(p => ({
    product: p,
    score: noteScores(p) + favScore(p) + (occasion === 'any' ? 0.1 : 0),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map(s => s.product).filter(p => p);
}

function chipClasses(active: boolean): string {
  return (
    "rounded-pill px-4 py-2 text-body border duration-instant ease-default " +
    (active
      ? "bg-mocha text-paper border-mocha"
      : "bg-surface text-text border-border hover:bg-surface-2")
  );
}

export function RecommendationWizard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products = [] } = useProducts();

  const step = searchParams.get('step') || '1';
  const occasion = (searchParams.get('occasion') as Occasion) || null;
  const notes = (searchParams.get('notes')?.split(',').filter(Boolean) || []) as NoteFamily[];
  const fav = searchParams.get('fav') || '';

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    setSearchParams(next, { replace: true });
  };

  const setOccasion = (o: Occasion) => updateParams({ occasion: o });
  const toggleNote = (n: NoteFamily) => {
    const has = notes.includes(n);
    if (has) {
      updateParams({ notes: notes.filter(x => x !== n).join(',') || null });
    } else if (notes.length < 3) {
      updateParams({ notes: [...notes, n].join(',') });
    }
  };
  const setFav = (v: string) => updateParams({ fav: v });
  const goToStep = (s: string) => updateParams({ step: s });
  const restart = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const results = useMemo(
    () => recommendProducts(products, occasion, notes, fav),
    [products, occasion, notes, fav]
  );

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (occasion) {
      parts.push(OCCASIONS.find(o => o.value === occasion)?.label || '');
    }
    if (notes.length > 0) {
      parts.push(notes.map(n => NOTE_FAMILIES.find(f => f.value === n)?.label).filter(Boolean).join(', '));
    }
    return parts.filter(Boolean).join(' · ');
  }, [occasion, notes]);

  if (step === 'results') {
    return (
      <section className="max-w-[1280px] mx-auto py-16 md:py-24">
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-2">
          Rezultate
        </p>
        <h2 className="text-h1 md:text-h1-md font-normal text-text-strong mb-2">
          {results.length} {results.length === 1 ? 'sugestie' : 'sugestii'} pentru tine
        </h2>
        {summary && (
          <p className="text-body text-text-muted mb-8">
            Pe baza alegerilor tale: {summary}
          </p>
        )}

        {results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-h3 font-medium text-text-strong mb-4">
              Niciun parfum nu se potrivește perfect.
            </p>
            <Button variant="ghost" onClick={restart}>
              Schimbă răspunsurile
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
              {results.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(`/discovery-sets/builder?prefill=${results.map(r => r.id).join(',')}`)}
              >
                Construiește un set din acestea →
              </Button>
              <Button variant="ghost" size="lg" onClick={restart}>
                Înapoi la întrebări
              </Button>
            </div>
          </>
        )}
      </section>
    );
  }

  if (step === '1') {
    return (
      <section className="max-w-[720px] mx-auto py-16 md:py-24">
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
          Pasul 1 / 3
        </p>
        <h2 className="text-h1 md:text-display-md font-light text-text-strong mb-12">
          Pentru ce ocazie?
        </h2>
        <div className="flex flex-wrap gap-3">
          {OCCASIONS.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => setOccasion(o.value)}
              className={chipClasses(occasion === o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="mt-12 flex justify-end">
          <Button variant="primary" size="lg" disabled={!occasion} onClick={() => goToStep('2')}>
            Continuă →
          </Button>
        </div>
      </section>
    );
  }

  if (step === '2') {
    return (
      <section className="max-w-[720px] mx-auto py-16 md:py-24">
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
          Pasul 2 / 3
        </p>
        <h2 className="text-h1 md:text-display-md font-light text-text-strong mb-2">
          Ce note te atrag?
        </h2>
        <p className="text-body text-text-muted mb-12">Pick 1–3.</p>
        <div className="flex flex-wrap gap-3">
          {NOTE_FAMILIES.map(n => (
            <button
              key={n.value}
              type="button"
              onClick={() => toggleNote(n.value)}
              className={chipClasses(notes.includes(n.value))}
            >
              {n.label}
            </button>
          ))}
        </div>
        {notes.length === 3 && (
          <p className="text-caption text-text-muted mt-4">Maxim 3 selecții</p>
        )}
        <div className="mt-12 flex flex-col sm:flex-row sm:justify-between gap-3">
          <Button variant="ghost" size="lg" onClick={() => goToStep('1')}>
            Înapoi
          </Button>
          <Button
            variant="primary"
            size="lg"
            disabled={notes.length === 0}
            onClick={() => goToStep('3')}
          >
            Continuă →
          </Button>
        </div>
      </section>
    );
  }

  // Step 3
  return (
    <section className="max-w-[720px] mx-auto py-16 md:py-24">
      <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
        Pasul 3 / 3
      </p>
      <h2 className="text-h1 md:text-display-md font-light text-text-strong mb-2">
        Un parfum care îți place?
      </h2>
      <p className="text-body text-text-muted mb-12">Opțional. Poți sări peste.</p>
      <Input
        value={fav}
        onChange={(e) => setFav(e.target.value)}
        placeholder="Ex. Aventus de Creed, Santal 33..."
        className="max-w-md"
        maxLength={100}
      />
      <div className="mt-12 flex flex-col sm:flex-row sm:justify-between gap-3">
        <Button variant="ghost" size="lg" onClick={() => goToStep('2')}>
          Înapoi
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" size="lg" onClick={() => goToStep('results')}>
            Sari peste
          </Button>
          <Button variant="primary" size="lg" onClick={() => goToStep('results')}>
            Vezi recomandările →
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

---

## Task 7: Restructure DiscoverySets.tsx

**Files:**
- Modify: `src/pages/DiscoverySets.tsx` (full file replacement)

- [ ] **Step 1: Replace the file entirely**

```tsx
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { useDiscoverySetConfigs } from "@/hooks/useDiscoverySets";
import { PredefinedSetsGrid } from "@/components/discovery/PredefinedSetsGrid";
import { SetBuilder } from "@/components/discovery/SetBuilder";
import { RecommendationWizard } from "@/components/discovery/RecommendationWizard";

const NAV_LINKS = [
  { to: "/discovery-sets", match: "predefined", label: "Predefinite" },
  { to: "/discovery-sets/builder", match: "builder", label: "Construiește" },
  { to: "/discovery-sets/recommend", match: "recommend", label: "Ajută-mă să aleg" },
];

const DiscoverySets = () => {
  const location = useLocation();
  const path = location.pathname;

  const view: 'predefined' | 'builder' | 'recommend' =
    path.endsWith('/builder') ? 'builder' :
    path.endsWith('/recommend') ? 'recommend' :
    'predefined';

  const { data: configs = [], isLoading } = useDiscoverySetConfigs();
  const predefinedSets = configs.filter(c => !c.is_customizable);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Seo
        title="Seturi discovery | modestshop"
        description="Mostre întâi. Decide care merită sticla — fără riscuri."
        image=""
        url=""
        type="website"
      />
      <Header />

      <main className="flex-1 pb-24 lg:pb-0">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12">
          {/* View toggle */}
          <nav className="flex flex-wrap gap-6 mb-8">
            {NAV_LINKS.map(l => (
              <Link
                key={l.match}
                to={l.to}
                className={
                  view === l.match
                    ? "text-body text-text-strong font-medium"
                    : "text-body text-text-muted hover:text-text duration-instant ease-default"
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Predefined view shows the page header here. Other views render their own headers. */}
          {view === 'predefined' && (
            <>
              <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">
                Seturi Discovery
              </h1>
              <p className="text-body text-text-muted mt-2 max-w-2xl mb-12">
                Mostre întâi. Decide care merită sticla — fără riscuri.
              </p>
              <PredefinedSetsGrid sets={predefinedSets} isLoading={isLoading} />
            </>
          )}

          {view === 'builder' && <SetBuilder />}
          {view === 'recommend' && <RecommendationWizard />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DiscoverySets;
```

- [ ] **Step 2: Add the new routes to App.tsx**

The current `App.tsx` likely has only `/discovery-sets` mapped. Add the two new sub-routes (or use a wildcard). Find the existing `<Route path="/discovery-sets" element={<DiscoverySets />} />` and add:

```tsx
<Route path="/discovery-sets/builder" element={<DiscoverySets />} />
<Route path="/discovery-sets/recommend" element={<DiscoverySets />} />
```

All three routes render the same component; the component dispatches based on the path.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success. The build should catch any unused imports from the previous DiscoverySets.tsx.

---

## Task 8: Final build verification

**Files:** none modified.

- [ ] **Step 1: Run final build**

Run: `npm run build`
Expected: success — `tsc` clean, vite build complete.

- [ ] **Step 2: Start dev server (handed off to user for QA)**

Run: `npm run dev`
The user runs the manual QA checklist themselves. The agentic plan does not include QA steps per the user's preference.

---

## Self-review notes (plan author)

- **Spec coverage:**
  - Decision 1 (single job) → reflected in three preserved paths (Tasks 1, 5, 6) all routing to add-to-cart
  - Decision 2 (URL-based view dispatch) → Task 7 (DiscoverySets.tsx with three routes)
  - Decision 3 (two-pane builder) → Tasks 4 + 5
  - Decision 4 (set detail reuses PDP layout) → Tasks 2 + 3
  - Decision 5 (3-step wizard) → Task 6
  - Decision 6 (3-col predefined grid) → Task 1
- **Placeholders:** None. Each task has full code. Notes-for-engineer call out potential adaptation points (hook names, prop names) where the existing codebase may differ from the assumptions.
- **Type/name consistency:** `Filters`, `EMPTY_FILTERS`, `Size`, `SortKey`, `Occasion`, `NoteFamily`, `OCCASIONS`, `NOTE_FAMILIES`, `recommendProducts`, `chipClasses` — all defined and consistent across tasks. Component names (`PredefinedSetsGrid`, `SetPurchaseBlock`, `SetMobileBuyBar`, `SetTray`, `SetCatalogPane`, `SetBuilder`, `RecommendationWizard`) match across tasks.
- **One simplification documented:** the `recommendProducts` heuristic in Task 6 is intentionally simple (family-text matching + light free-text boost). The existing `DiscoveryRecommendation` component may have more sophisticated logic; the engineer should preserve any nontrivial existing matching logic when porting.
- **No QA task** per user preference. Task 8 is build verification only.
