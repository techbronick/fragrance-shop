# Redesign Phase 2 — PDP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Product Detail Page using the Phase 1 design system. Strip from ~700 lines to ~250 lines on `Product.tsx`, extract 6 focused components, swap the duplicated mobile/desktop purchase cards for one shared-state component plus a sticky mobile buy bar, and remove every piece of decoration that doesn't serve the page's single job.

**Architecture:** Six new components in `src/components/product/`, each with one clear responsibility (`ProductImage`, `SizeSelector`, `PurchaseBlock`, `MobileBuyBar`, `NotesSection`, `DetailsSection`). State (`selectedSku`, `quantity`) lives in `Product.tsx` and flows down via props. Mobile sticky bar uses `IntersectionObserver` on the inline purchase block. Image lightbox uses shadcn `Dialog`.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, shadcn/Radix, `@tanstack/react-query`, Supabase JS. Phase 1 design tokens (Inter, warm-neutral ramp, mocha anchor, motion durations) are the substrate.

**Spec:** `docs/superpowers/specs/2026-04-27-redesign-phase-2-pdp-design.md`

**Environment notes:**
- No test runner. Verification = `npm run build` (runs `tsc && vite build`). Manual QA in Task 8.
- ESLint pre-broken — skip `npm run lint`.
- Not a git repo. No commits. Save points = build green + tree clean.
- Path alias `@/*` → `src/*`.
- Phase 1 design tokens (Inter, warm-neutral palette, motion, primitives) already in production. New components consume them; do NOT add new tokens.
- Tasks 1–6 build new components in isolation (each builds without errors but doesn't render anywhere). Task 7 wires them into `Product.tsx`. Task 8 verifies.

---

## File structure

**Create (6 files):**
- `src/components/product/SizeSelector.tsx` — pill row, dedup by (size_ml, price)
- `src/components/product/ProductImage.tsx` — single image + lightbox dialog
- `src/components/product/PurchaseBlock.tsx` — brand/name/desc/sizes/price/qty/button/optional-stamps
- `src/components/product/MobileBuyBar.tsx` — fixed-bottom bar, IntersectionObserver-driven
- `src/components/product/NotesSection.tsx` — Vârf/Inimă/Bază rows
- `src/components/product/DetailsSection.tsx` — Brand/Concentrație/Familie/An/Gen/Rating + Fragrantica footnote

**Modified (1 file):**
- `src/pages/Product.tsx` — restructured from ~700 lines to ~250 lines

---

## Task 1: SizeSelector

**Files:**
- Create: `src/components/product/SizeSelector.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { SKU } from "@/types/database";

type Props = {
  skus: SKU[];
  selectedSkuId: string;
  onChange: (sku: SKU) => void;
  className?: string;
};

export function SizeSelector({ skus, selectedSkuId, onChange, className }: Props) {
  // Dedup by (size_ml, price) — preserves current Product.tsx behavior
  const seen = new Set<string>();
  const unique = skus
    .filter((s) => {
      const key = s.size_ml + '|' + s.price;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.size_ml - b.size_ml);

  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ''}`}>
      {unique.map((sku) => {
        const isActive = sku.id === selectedSkuId;
        const isOos = sku.stock <= 0;
        return (
          <button
            key={sku.id}
            type="button"
            onClick={() => onChange(sku)}
            aria-pressed={isActive}
            className={
              "rounded-pill px-4 py-2 text-body border transition-colors duration-instant ease-default " +
              (isActive
                ? "bg-mocha text-paper border-mocha"
                : "bg-surface text-text border-border hover:bg-surface-2") +
              (isOos ? " opacity-60" : "")
            }
          >
            {sku.size_ml}ml
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Save point**

---

## Task 2: ProductImage with lightbox

**Files:**
- Create: `src/components/product/ProductImage.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  fallback?: string;
};

export function ProductImage({ src, alt, fallback }: Props) {
  const [errored, setErrored] = useState(false);
  const [open, setOpen] = useState(false);
  const displaySrc = errored && fallback ? fallback : src;

  return (
    <>
      <button
        type="button"
        onClick={() => !errored && setOpen(true)}
        disabled={errored}
        className="block w-full aspect-square bg-surface-2 rounded-md overflow-hidden"
        aria-label="Mărește imaginea"
      >
        <img
          src={displaySrc}
          alt={alt}
          className="w-full h-full object-cover"
          loading="eager"
          onError={() => setErrored(true)}
        />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(100vw,90vh)] aspect-square p-0 bg-paper">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 z-10 h-10 w-10 inline-flex items-center justify-center rounded-md text-text hover:bg-surface-2 duration-instant ease-default"
            aria-label="Închide"
          >
            <X />
          </button>
          <img
            src={displaySrc}
            alt={alt}
            className="w-full h-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success. Confirms shadcn `Dialog` exports are available (already verified during Phase 1 Task 16).

- [ ] **Step 3: Save point**

---

## Task 3: PurchaseBlock

**Files:**
- Create: `src/components/product/PurchaseBlock.tsx`

This component depends on `SizeSelector` from Task 1 and the existing `<ShippingEstimate>` (sub-project D). The `Product` and `SKU` types come from `@/types/database`.

- [ ] **Step 1: Create the file**

```tsx
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Product, SKU } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";
import { ShippingEstimate } from "@/components/ShippingEstimate";
import { SizeSelector } from "@/components/product/SizeSelector";

type Props = {
  product: Product;
  skus: SKU[];
  selectedSku: SKU | null;
  onSizeChange: (sku: SKU) => void;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: () => void;
};

export function PurchaseBlock({
  product,
  skus,
  selectedSku,
  onSizeChange,
  quantity,
  onQuantityChange,
  onAddToCart,
}: Props) {
  const oos = !!selectedSku && selectedSku.stock <= 0;
  const buttonText = oos ? "Comandă (7–14 zile)" : "Adaugă în coș";

  return (
    <div className="space-y-6">
      {/* Header: brand, name, description */}
      <div className="space-y-2">
        <p className="text-caption text-text-muted uppercase tracking-[0.06em]">
          {product.brand}
        </p>
        <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">
          {product.name}
        </h1>
        {product.description && (
          <p className="text-body text-text-muted line-clamp-2">
            {product.description}
          </p>
        )}
      </div>

      {/* Size selector or empty state */}
      {skus.length > 0 ? (
        <SizeSelector
          skus={skus}
          selectedSkuId={selectedSku?.id ?? ''}
          onChange={onSizeChange}
        />
      ) : (
        <p className="text-caption text-text-muted">
          Nu există variante disponibile.
        </p>
      )}

      {/* Price + shipping estimate */}
      {selectedSku && (
        <div className="space-y-2">
          <p className="text-h2 md:text-h2-md font-normal text-text-strong">
            {formatPrice(selectedSku.price * quantity)}
          </p>
          <ShippingEstimate stocks={[selectedSku.stock]} />
        </div>
      )}

      {/* Quantity stepper */}
      {selectedSku && (
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
      )}

      {/* Add to cart */}
      {selectedSku && (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onAddToCart}
        >
          {buttonText}
        </Button>
      )}

      {/* Optional stamps: concentration + family */}
      {(product.concentration || product.family) && (
        <>
          <hr className="border-border" />
          <div className="space-y-2">
            {product.concentration && (
              <div className="flex justify-between text-body">
                <span className="text-text-muted">Concentrație</span>
                <span className="text-text">{product.concentration}</span>
              </div>
            )}
            {product.family && (
              <div className="flex justify-between text-body">
                <span className="text-text-muted">Familie</span>
                <span className="text-text">{product.family}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success. If `tsc` complains about missing fields on `Product`, re-check `src/types/database.ts` — the `Product` interface has `brand`, `name`, `description`, `concentration`, `family` (verified in Phase 1 audit).

- [ ] **Step 3: Save point**

---

## Task 4: MobileBuyBar

**Files:**
- Create: `src/components/product/MobileBuyBar.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useEffect, useState, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { SKU } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";

type Props = {
  selectedSku: SKU | null;
  quantity: number;
  onAddToCart: () => void;
  /** Ref to the inline PurchaseBlock — when it scrolls out of view, the bar appears. */
  watchRef: RefObject<HTMLElement>;
};

export function MobileBuyBar({ selectedSku, quantity, onAddToCart, watchRef }: Props) {
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

  if (!selectedSku || !visible) return null;

  const scrollBack = () => {
    watchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const oos = selectedSku.stock <= 0;
  const buttonText = oos ? "Comandă" : "Adaugă în coș";

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
          <span className="text-text-muted">{selectedSku.size_ml}ml</span>
          <span className="mx-2 text-text-faint">·</span>
          <span>{formatPrice(selectedSku.price * quantity)}</span>
        </button>
        <Button variant="primary" size="md" onClick={onAddToCart}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Save point**

---

## Task 5: NotesSection

**Files:**
- Create: `src/components/product/NotesSection.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { Product } from "@/types/database";

type Props = {
  product: Product;
};

export function NotesSection({ product }: Props) {
  const hasAny =
    (product.notes_top && product.notes_top.length > 0) ||
    (product.notes_mid && product.notes_mid.length > 0) ||
    (product.notes_base && product.notes_base.length > 0);

  if (!hasAny) return null;

  return (
    <section className="max-w-[720px] mx-auto">
      <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
        Note olfactive
      </p>
      <div className="space-y-0">
        {product.notes_top && product.notes_top.length > 0 && (
          <div className="flex items-baseline gap-6 py-4 border-b border-border">
            <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-20 shrink-0">
              Vârf
            </span>
            <span className="text-body text-text">{product.notes_top.join(', ')}</span>
          </div>
        )}
        {product.notes_mid && product.notes_mid.length > 0 && (
          <div className="flex items-baseline gap-6 py-4 border-b border-border">
            <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-20 shrink-0">
              Inimă
            </span>
            <span className="text-body text-text">{product.notes_mid.join(', ')}</span>
          </div>
        )}
        {product.notes_base && product.notes_base.length > 0 && (
          <div className="flex items-baseline gap-6 py-4">
            <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-20 shrink-0">
              Bază
            </span>
            <span className="text-body text-text">{product.notes_base.join(', ')}</span>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Save point**

---

## Task 6: DetailsSection

**Files:**
- Create: `src/components/product/DetailsSection.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { Product } from "@/types/database";
import { Rating } from "@/components/Rating";
import { ExternalLink } from "lucide-react";

type Props = {
  product: Product;
};

function genderLabel(p: Product): string {
  // Schema only has gender_neutral boolean. Preserve current behavior:
  // 'Unisex' if gender_neutral, otherwise 'Masculin / Feminin'. If a
  // dedicated gender field gets added later, this is the swap point.
  return p.gender_neutral ? 'Unisex' : 'Masculin / Feminin';
}

function fragranticaUrl(p: Product): string {
  const q = encodeURIComponent(`${p.brand} ${p.name}`);
  return `https://www.fragrantica.com/search/?q=${q}`;
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-baseline gap-6 py-4 border-b border-border">
    <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-32 shrink-0">
      {label}
    </span>
    <div className="flex-1 text-body text-text">{children}</div>
  </div>
);

export function DetailsSection({ product }: Props) {
  return (
    <section className="max-w-[720px] mx-auto">
      <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
        Detalii
      </p>
      <div className="space-y-0">
        <Row label="Brand">{product.brand}</Row>
        <Row label="Concentrație">{product.concentration}</Row>
        <Row label="Familie">{product.family}</Row>
        <Row label="An">{product.launch_year}</Row>
        <Row label="Gen">{genderLabel(product)}</Row>
        <Row label="Rating">
          <Rating value={product.rating} count={product.review_count} />
        </Row>
      </div>
      <a
        href={fragranticaUrl(product)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text mt-6 duration-instant ease-default"
      >
        Vezi pe Fragrantica <ExternalLink className="h-3 w-3" />
      </a>
    </section>
  );
}
```

Notes:
- The "Ocazii" row from the spec is **not** rendered. The current `Product` schema has no `occasions` field; the existing PDP renders hardcoded badges with no DB backing. Per the spec's "no fictional data" stance (same rationale as the longevity/projection bars removed in Phase 1 Task 10), we drop them. If a real occasions field lands later, add a row above the Fragrantica link.
- `<Rating>` was created in Phase 1 Task 7 (`src/components/Rating.tsx`).

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Save point**

---

## Task 7: Restructure Product.tsx

**Files:**
- Modify: `src/pages/Product.tsx` (replaces entire file)

This is the biggest single replacement. The previous ~700-line file had: routing, image-fallback state, SKU dedup, RadioGroup picker, mobile inline purchase card, desktop sticky purchase card, FragranceNotesPyramid, ProductSpecs, PerformanceInfo (already removed Phase 1), OccasionsInfo, DetailedDescription, BenefitsList. Replace it with a ~250-line orchestration that uses the 6 new components.

- [ ] **Step 1: Replace `src/pages/Product.tsx` entirely**

```tsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useProduct } from "@/hooks/useProducts";
import { useSKUs } from "@/hooks/useSKUs";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/ProductImage";
import { PurchaseBlock } from "@/components/product/PurchaseBlock";
import { MobileBuyBar } from "@/components/product/MobileBuyBar";
import { NotesSection } from "@/components/product/NotesSection";
import { DetailsSection } from "@/components/product/DetailsSection";
import { SKU } from "@/types/database";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=600&h=600&q=75&fm=webp";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading: productLoading } = useProduct(id || "");
  const { data: skus = [], isLoading: skusLoading } = useSKUs(id || "");
  const [selectedSku, setSelectedSku] = useState<SKU | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();
  const inlinePurchaseRef = useRef<HTMLDivElement>(null);

  // Default selection: smallest available SKU. Set once SKUs load.
  useEffect(() => {
    if (!selectedSku && skus.length > 0) {
      const sorted = [...skus].sort((a, b) => a.size_ml - b.size_ml);
      setSelectedSku(sorted[0]);
    }
  }, [skus, selectedSku]);

  if (productLoading || skusLoading) {
    return <PdpSkeleton />;
  }

  if (!id || !product) {
    return <PdpNotFound onBack={() => navigate('/shop')} />;
  }

  const handleAddToCart = () => {
    if (!selectedSku) return;
    addItem({
      id: product.id,
      type: 'product',
      name: product.name,
      brand: product.brand,
      quantity,
      price: Math.round(selectedSku.price / 100), // bani -> Lei
      sizeLabel: `${selectedSku.size_ml}ml`,
      image: product.image_url,
      skuId: selectedSku.id,
    });
    toast({
      title: 'Adăugat în coș',
      description: `${product.name} · ${selectedSku.size_ml}ml`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Seo
        title={`${product.name} | ${product.brand} | modestshop`}
        description={product.description || ''}
        image={product.image_url}
        url=""
        type="product"
      />
      <Header />

      <main className="flex-1">
        {/* Above the fold: 12-col grid, image cols 1–7, purchase cols 8–12 */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-7">
            <ProductImage
              src={product.image_url}
              alt={`${product.brand} ${product.name}`}
              fallback={FALLBACK_IMAGE}
            />
          </div>
          <div
            ref={inlinePurchaseRef}
            className="md:col-span-5 md:sticky md:top-24 md:self-start"
          >
            <PurchaseBlock
              product={product}
              skus={skus}
              selectedSku={selectedSku}
              onSizeChange={setSelectedSku}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>

        {/* Below the fold: 720px column with 64px section gap */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-24 md:pb-32 space-y-16">
          <NotesSection product={product} />
          <DetailsSection product={product} />
        </div>
      </main>

      <Footer />

      <MobileBuyBar
        selectedSku={selectedSku}
        quantity={quantity}
        onAddToCart={handleAddToCart}
        watchRef={inlinePurchaseRef}
      />
    </div>
  );
};

const PdpSkeleton = () => (
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
        <div className="flex gap-2">
          <div className="h-10 w-16 bg-surface-2 animate-shimmer skeleton-shimmer rounded-pill" />
          <div className="h-10 w-16 bg-surface-2 animate-shimmer skeleton-shimmer rounded-pill" />
          <div className="h-10 w-16 bg-surface-2 animate-shimmer skeleton-shimmer rounded-pill" />
        </div>
        <div className="h-8 w-32 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
        <div className="h-12 w-full bg-surface-2 animate-shimmer skeleton-shimmer rounded-md" />
      </div>
    </main>
    <Footer />
  </div>
);

const PdpNotFound = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen flex flex-col bg-paper">
    <Header />
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-4">
          Produs indisponibil
        </h1>
        <p className="text-body text-text-muted mb-8">
          Produsul nu este disponibil momentan.
        </p>
        <Button variant="ghost" onClick={onBack}>
          Înapoi la Magazin
        </Button>
      </div>
    </main>
    <Footer />
  </div>
);

export default Product;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success. If TS errors are about unused imports from the old file (Card, CardContent, Heart, Star, etc.), they'll be gone since the entire file was replaced — no leftover imports.

- [ ] **Step 3: Save point**

---

## Task 8: Full verification + manual QA

**Files:** none modified.

- [ ] **Step 1: Final build**

Run: `npm run build`
Expected: success.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`
Vite serves at `http://localhost:5173`.

- [ ] **Step 3: Manual QA — desktop**

Navigate to a product (`/product/<some-id>`). Mark ✅/❌:

1. **Layout**: image on the left (~58% width at 1280px), purchase block on the right.
2. **Image**: 1:1 ratio, sits on `bg-surface-2`. Click → lightbox opens at near-viewport size. Esc closes. Tap-outside closes.
3. **Purchase block sticky**: scroll page down → purchase block stays visible until the below-the-fold sections scroll past it.
4. **Brand caption** (eyebrow style, uppercase tracked) above the product name. **Name** in `text-h1-md` (36px), regular weight. **Description** truncated to 2 lines (no "read more").
5. **Size selector**: pill row, gap of 8px, active pill in mocha. Out-of-stock pills dimmed but clickable.
6. **Price** in `text-h2-md` (24px), regular weight. Updates with quantity AND with size selection.
7. **Shipping estimate** appears below price (`🚚 1–3 zile` or `🚚 7–14 zile` depending on stock).
8. **Quantity stepper** with `−`/`+` buttons; `−` disabled at 1; quantity centered between buttons.
9. **Add-to-cart button**: full-width, primary mocha, `lg` size. Text is `Adaugă în coș` (in-stock) or `Comandă (7–14 zile)` (out-of-stock).
10. **Stamps**: `Concentrație · EDP` and `Familie · Lemnos` rows below a divider, only if data exists.
11. **No mobile buy bar** visible on desktop.

- [ ] **Step 4: Manual QA — below the fold**

12. **Notes section** (single column, max-width 720px, centered). Eyebrow `NOTE OLFACTIVE`. Three rows: `Vârf`, `Inimă`, `Bază` with note lists. 1px borders between rows. Section omitted entirely if no notes.
13. **Detalii section** below notes (64px gap). Six rows: Brand · Concentrație · Familie · An · Gen · Rating. Quiet `Vezi pe Fragrantica ↗` link below the rows.
14. **No** longevity/projection bars (already gone from Phase 1).
15. **No** "Experiența Olfactivă" gradient callout, no "Main Features"/"Perfect Moment" 2-column box, no benefits checkmarks list.
16. **No** Heart/Share icons, no "Înapoi" button at top.

- [ ] **Step 5: Manual QA — mobile**

Resize browser to ~375px width or use mobile devtools.

17. **Stacked layout**: image full-width, purchase block below it.
18. **Mobile buy bar appears** when scrolled past the inline purchase block. Disappears when scrolled back up.
19. **Bar contents**: `30ml · 1500 Lei` on the left (where 30ml is the selected size), `Adaugă în coș` button on the right. Bar is ~64px tall, paper background, top border.
20. **Tap on size+price text** in the bar → smooth-scrolls back to the inline purchase block.
21. **Tap on Add** in the bar → same as inline button (toast appears, cart-icon badge updates).
22. **Safe area** respected — on iPhone simulator, bar sits above the home indicator.

- [ ] **Step 6: Manual QA — interactions**

23. Switch sizes → price updates. Out-of-stock size → button label changes to `Comandă (7–14 zile)` and shipping estimate changes to `7–14 zile`.
24. Set qty to 3, switch size → price recomputes for `selectedSku.price * 3` of the new size.
25. Add to cart → toast appears, cart-icon badge in the header updates, CartSheet (from Phase 1) reflects the new item.
26. Open CartSheet from header → product image/name/size/price all match.

- [ ] **Step 7: Manual QA — states**

27. Navigate to `/product/INVALID_ID` → "Produs indisponibil" page renders with `Înapoi la Magazin` button.
28. With slow network throttling, the skeleton renders matching the layout (no perceived layout shift on load).

- [ ] **Step 8: Stop dev server**

Ctrl-C the running `npm run dev`.

- [ ] **Step 9: Final save point**

PDP redesign complete. 6 new components, 1 file restructured. The PDP is now ~250 lines down from ~700, with the visual layer aligned to the Phase 1 design system.

---

## Self-review notes (plan author)

- **Spec coverage:**
  - Single job (purchase confidence) → reflected in what each task includes/excludes.
  - Two-column desktop / stacked mobile → Task 7's `<main>` JSX.
  - Single PurchaseBlock + separate MobileBuyBar sharing state → Tasks 3, 4, 7.
  - Single image + lightbox → Task 2.
  - Pill-row size selector → Task 1.
  - Three sections only → Tasks 5, 6, 7.
  - Heart/share gone, quiet badge pulse, compact qty → Task 7 (omitted) + Task 3 (qty stepper).
  - Mobile sticky bar (minimal, always visible after scroll-past) → Task 4.
  - Edge cases (loading, not-found, no SKUs, OOS, image error, reduced motion) → Task 7's `PdpSkeleton`/`PdpNotFound` + Task 2's `errored` state + Task 3's conditional rendering.
- **Placeholders:** None. Every component task has full code. Task 8 has a 28-item QA list, not a vague "test it manually."
- **Type/name consistency:** `selectedSku`, `setSelectedSku`, `quantity`, `setQuantity`, `onAddToCart`, `handleAddToCart`, `inlinePurchaseRef`, `watchRef`, `FALLBACK_IMAGE` are used verbatim in Tasks 3, 4, 7. Component names (`SizeSelector`, `ProductImage`, `PurchaseBlock`, `MobileBuyBar`, `NotesSection`, `DetailsSection`, `Rating`) match across the plan.
- **One judgment call** flagged in Task 6 notes: dropping the hardcoded "Ocazii" badges from the previous PDP, treating them as fictional data per the same standard that removed the longevity/projection bars in Phase 1 Task 10.
