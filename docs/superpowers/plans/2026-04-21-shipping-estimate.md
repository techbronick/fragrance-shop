# Shipping Estimate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a `🚚 1–3 zile` / `🚚 7–14 zile` shipping estimate on product page, mini-cart dropdown, checkout, and order confirmation — derived live from `skus.stock` with no DB changes.

**Architecture:** One pure utility (`shippingEstimate.ts`) holding constants and the aggregation function, one presentational component (`ShippingEstimate`), one React Query hook (`useSKUStocks`) for batch stock lookup, and a thin cart-aware wrapper (`ShippingEstimateForCart`) reused by both mini-cart and checkout. Integration tasks each add one or two lines to existing files.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, `@tanstack/react-query`, Supabase JS.

**Environment notes:**
- No test runner configured. Verification per task = `npm run lint` (fast) and `npm run build` (catches TS errors). Behavioral verification is the manual QA checklist at the end (Task 9).
- Directory is not a git repo. "Save point" replaces `git commit` — ensure the tree is clean and the build passes at each save point.
- Path alias `@/*` → `src/*` (configured in `vite.config.ts`).
- UI copy is Romanian. Keep all user-facing strings in the constants module so sub-project A (i18n) can swap them later.

**Spec:** `docs/superpowers/specs/2026-04-21-shipping-estimate-design.md`

---

## File Structure

**Create (4 files):**
- `src/utils/shippingEstimate.ts` — constants + `getShippingEstimate(stocks)` pure function
- `src/components/ShippingEstimate.tsx` — renders the single-line estimate or nothing
- `src/hooks/useSKUStocks.ts` — React Query hook, batch fetches `skus.stock` by id list
- `src/components/ShippingEstimateForCart.tsx` — cart-aware wrapper used in mini-cart and checkout; includes `collectCartSkuIds` helper

**Modify (4 files):**
- `src/pages/Product.tsx` — insert estimate inside the "Preț Total" card in both mobile and desktop layouts (~lines 548 and 701)
- `src/components/Header.tsx` — insert `<ShippingEstimateForCart />` in the mini-cart dropdown footer (~line 275, above the action buttons row)
- `src/pages/Checkout.tsx` — insert `<ShippingEstimateForCart />` in the order-summary card (~line 583, between the Shipping row and the `Total` separator)
- `src/pages/OrderConfirmation.tsx` — inline wrapper reading `order.items[*].sku_id` + `order.items[*].snapshot.items[*].sku_id` (for bundles) → `useSKUStocks` → `<ShippingEstimate>`. Placed below the items list inside the existing Card (~after line 142)

---

## Task 1: Shipping estimate utility (pure)

**Files:**
- Create: `src/utils/shippingEstimate.ts`

- [ ] **Step 1: Create the utility file**

Create `src/utils/shippingEstimate.ts` with exactly this content:

```ts
// Pure shipping-estimate logic. All copy lives here so sub-project A (i18n)
// has a single swap point.

export const IN_STOCK_DAYS = { minDays: 1, maxDays: 3 } as const;
export const BACKORDER_DAYS = { minDays: 7, maxDays: 14 } as const;

export const SHIPPING_COPY = {
  inStock: 'În stoc',
  backorder: 'La comandă',
  daysUnit: 'zile',
  prefix: '🚚',
} as const;

export type ShippingEstimate =
  | { type: 'in_stock'; minDays: number; maxDays: number }
  | { type: 'backorder'; minDays: number; maxDays: number };

/**
 * Aggregate shipping estimate for a list of SKU stock values.
 *
 * - [] → null (caller renders nothing)
 * - any stock <= 0 → 'backorder' (slowest wins)
 * - all stocks > 0 → 'in_stock'
 */
export function getShippingEstimate(
  stocks: number[],
): ShippingEstimate | null {
  if (stocks.length === 0) return null;
  const anyOutOfStock = stocks.some((s) => s <= 0);
  return anyOutOfStock
    ? { type: 'backorder', ...BACKORDER_DAYS }
    : { type: 'in_stock', ...IN_STOCK_DAYS };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run lint -- src/utils/shippingEstimate.ts`
Expected: exits 0 (no warnings, no errors).

- [ ] **Step 3: Save point**

The file is self-contained with no imports from other project modules — nothing else to verify here.

---

## Task 2: Presentational component

**Files:**
- Create: `src/components/ShippingEstimate.tsx`

- [ ] **Step 1: Create the component file**

Create `src/components/ShippingEstimate.tsx` with exactly this content:

```tsx
import { getShippingEstimate, SHIPPING_COPY } from '@/utils/shippingEstimate';

type Props = {
  stocks: number[];
  className?: string;
};

export function ShippingEstimate({ stocks, className }: Props) {
  const est = getShippingEstimate(stocks);
  if (!est) return null;

  return (
    <div
      className={
        'text-sm text-muted-foreground ' + (className ?? '')
      }
    >
      {SHIPPING_COPY.prefix} {est.minDays}–{est.maxDays} {SHIPPING_COPY.daysUnit}
    </div>
  );
}
```

Notes:
- The `className` prop lets callers tweak alignment/padding without editing the component.
- Uses `text-muted-foreground` to match other secondary info on the site.
- Em dash (`–`) between days matches the design; it is U+2013 (EN DASH), not a hyphen.

- [ ] **Step 2: Verify it compiles**

Run: `npm run lint -- src/components/ShippingEstimate.tsx`
Expected: exits 0.

- [ ] **Step 3: Save point**

Component is self-contained. No callers yet.

---

## Task 3: Batch stock fetch hook

**Files:**
- Create: `src/hooks/useSKUStocks.ts`

- [ ] **Step 1: Create the hook file**

Create `src/hooks/useSKUStocks.ts` with exactly this content:

```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch current stock values for a list of SKU ids, returned as an array of
 * numbers aligned with the sorted input ids. A SKU missing from the DB is
 * treated as 0 stock (safer — pushes aggregate to "backorder").
 *
 * The query key uses the sorted id list so callers that produce the same
 * set of ids in different orders share a cache entry.
 */
export function useSKUStocks(skuIds: string[]) {
  const sortedIds = [...skuIds].sort();

  return useQuery({
    queryKey: ['sku-stocks', sortedIds],
    queryFn: async (): Promise<number[]> => {
      if (sortedIds.length === 0) return [];

      const { data, error } = await supabase
        .from('skus')
        .select('id, stock')
        .in('id', sortedIds);

      if (error) throw error;

      const byId = new Map(
        (data ?? []).map((row) => [row.id, row.stock]),
      );
      return sortedIds.map((id) => byId.get(id) ?? 0);
    },
    enabled: sortedIds.length > 0,
  });
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run lint -- src/hooks/useSKUStocks.ts`
Expected: exits 0.

- [ ] **Step 3: Save point**

Hook is self-contained. No callers yet.

---

## Task 4: Cart wrapper + SKU-id collection helper

**Files:**
- Create: `src/components/ShippingEstimateForCart.tsx`

- [ ] **Step 1: Create the wrapper file**

Create `src/components/ShippingEstimateForCart.tsx` with exactly this content:

```tsx
import { CartItem, useCart } from '@/hooks/useCart';
import { useSKUStocks } from '@/hooks/useSKUStocks';
import { ShippingEstimate } from '@/components/ShippingEstimate';

/**
 * Flatten all SKU ids referenced by the cart, including those nested inside
 * custom-bundle `selectedItems`. Predefined bundles with no `selectedItems`
 * contribute no ids and are therefore treated as in-stock (per spec).
 *
 * Exported for reuse in tests/other callers and to keep the logic pure.
 */
export function collectCartSkuIds(items: CartItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    if (item.skuId) ids.push(item.skuId);
    if (item.selectedItems) {
      for (const sel of item.selectedItems) {
        if (sel.sku_id) ids.push(sel.sku_id);
      }
    }
  }
  return ids;
}

type Props = {
  className?: string;
};

export function ShippingEstimateForCart({ className }: Props) {
  const { items } = useCart();
  const skuIds = collectCartSkuIds(items);
  const { data: stocks = [] } = useSKUStocks(skuIds);
  return <ShippingEstimate stocks={stocks} className={className} />;
}
```

- [ ] **Step 2: Verify types and imports**

Run: `npm run lint -- src/components/ShippingEstimateForCart.tsx`
Expected: exits 0.

- [ ] **Step 3: Run full build to catch cross-module type errors**

Run: `npm run build`
Expected: build succeeds (both `tsc` and `vite build` complete). If `tsc` fails on `CartItem` import, re-check that `useCart.tsx` exports `CartItem` — confirmed at `src/hooks/useCart.tsx:3`.

- [ ] **Step 4: Save point**

All four new files now exist and type-check. The rest is integration.

---

## Task 5: Wire into Product.tsx (both layouts)

**Files:**
- Modify: `src/pages/Product.tsx`

Product.tsx has two near-identical render blocks (mobile and desktop). Each has a "Preț Total" card — insert the estimate inside it, directly below the price. Both insertions are the same snippet; apply it at both locations.

- [ ] **Step 1: Add the import**

At the top of `src/pages/Product.tsx`, with the other `@/components` imports, add:

```tsx
import { ShippingEstimate } from "@/components/ShippingEstimate";
```

- [ ] **Step 2: Insert estimate in the first "Preț Total" card (desktop layout, around line 548)**

Find this block (near line 548):

```tsx
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Preț Total</p>
                            <p className="text-2xl font-bold">
                              {formatPrice(currentSKU.price * quantity)}
                            </p>
                          </div>
```

Replace it with:

```tsx
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Preț Total</p>
                            <p className="text-2xl font-bold">
                              {formatPrice(currentSKU.price * quantity)}
                            </p>
                            <ShippingEstimate
                              stocks={[currentSKU.stock]}
                              className="mt-2 justify-center text-center"
                            />
                          </div>
```

- [ ] **Step 3: Insert estimate in the second "Preț Total" card (mobile layout, around line 701)**

The same block repeats around line 701. Apply the same replacement there. There are exactly two occurrences — both must be updated so behavior matches across breakpoints.

- [ ] **Step 4: Verify**

Run: `npm run lint -- src/pages/Product.tsx && npm run build`
Expected: both succeed.

- [ ] **Step 5: Save point**

Product page now shows `🚚 X–Y zile` under the price for the selected SKU.

---

## Task 6: Wire into Header.tsx mini-cart

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: Add the import**

At the top of `src/components/Header.tsx`, with the other `@/components` imports, add:

```tsx
import { ShippingEstimateForCart } from "@/components/ShippingEstimateForCart";
```

- [ ] **Step 2: Insert the estimate in the dropdown footer**

Find this block (around line 275):

```tsx
                  <div className="p-4 border-t flex gap-2">
                    <Button variant="outline" onClick={clearCart} disabled={items.length === 0} className="flex-1">
                      Golește Coșul
                    </Button>
                    <Button disabled={items.length === 0} onClick={goCheckout} className="flex-1">
                      Continuă către Plată
                    </Button>
                  </div>
```

Replace it with:

```tsx
                  {items.length > 0 && (
                    <div className="px-4 pt-3 pb-1 border-t">
                      <ShippingEstimateForCart />
                    </div>
                  )}
                  <div className="p-4 border-t flex gap-2">
                    <Button variant="outline" onClick={clearCart} disabled={items.length === 0} className="flex-1">
                      Golește Coșul
                    </Button>
                    <Button disabled={items.length === 0} onClick={goCheckout} className="flex-1">
                      Continuă către Plată
                    </Button>
                  </div>
```

The `items.length > 0` guard ensures no empty row when the cart is empty. The `<ShippingEstimateForCart />` internally handles the empty-stocks case, but wrapping avoids the extra `border-t` spacing when not needed.

- [ ] **Step 3: Verify**

Run: `npm run lint -- src/components/Header.tsx && npm run build`
Expected: both succeed.

- [ ] **Step 4: Save point**

Mini-cart dropdown now shows aggregate estimate above the action buttons.

---

## Task 7: Wire into Checkout.tsx order summary

**Files:**
- Modify: `src/pages/Checkout.tsx`

- [ ] **Step 1: Add the import**

At the top of `src/pages/Checkout.tsx`, with the other `@/components` imports, add:

```tsx
import { ShippingEstimateForCart } from "@/components/ShippingEstimateForCart";
```

- [ ] **Step 2: Insert between the Shipping row and the Total separator**

Find this block (around line 573):

```tsx
                  {/* Shipping */}
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Transport
                      <Info className="h-3 w-3" />
                    </span>
                    <span className="font-medium">
                      {formatCheckoutPrice(totals.shipping)}
                    </span>
                  </div>

                  <Separator className="my-4" />
```

Replace it with:

```tsx
                  {/* Shipping */}
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Transport
                      <Info className="h-3 w-3" />
                    </span>
                    <span className="font-medium">
                      {formatCheckoutPrice(totals.shipping)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <ShippingEstimateForCart />
                  </div>

                  <Separator className="my-4" />
```

- [ ] **Step 3: Verify**

Run: `npm run lint -- src/pages/Checkout.tsx && npm run build`
Expected: both succeed.

- [ ] **Step 4: Save point**

Checkout summary now shows aggregate estimate between the Transport line and the Total block.

---

## Task 8: Wire into OrderConfirmation.tsx

**Files:**
- Modify: `src/pages/OrderConfirmation.tsx`

OrderConfirmation reads `order.items` which are `OrderItem` rows. A row's `sku_id` is the top-level SKU (null for bundle rows). Bundle rows carry their sub-SKUs in `snapshot.items[].sku_id`. Both must be collected.

- [ ] **Step 1: Add the imports**

At the top of `src/pages/OrderConfirmation.tsx`, with the other `@/components`/`@/hooks` imports, add:

```tsx
import { ShippingEstimate } from "@/components/ShippingEstimate";
import { useSKUStocks } from "@/hooks/useSKUStocks";
```

- [ ] **Step 2: Build the SKU id list from the order**

Inside the `OrderConfirmation` component, after the `if (error || !order) { ... }` guard and before the main `return`, add:

```tsx
  const orderSkuIds: string[] = [];
  for (const item of order.items) {
    if (item.sku_id) orderSkuIds.push(item.sku_id);
    const snapshotItems = item.snapshot?.items;
    if (Array.isArray(snapshotItems)) {
      for (const sub of snapshotItems) {
        if (sub?.sku_id) orderSkuIds.push(sub.sku_id);
      }
    }
  }
  const { data: orderStocks = [] } = useSKUStocks(orderSkuIds);
```

Notes:
- `item.snapshot?.items` is present on bundle rows (see `src/hooks/useOrders.ts:194,305`); for SKU rows it's undefined. The `Array.isArray` guard is defensive.
- `useSKUStocks` is called unconditionally — it handles the empty-list case by staying disabled.

- [ ] **Step 3: Insert the estimate below the items list, above the totals**

Find this block (inside the "Produse Comandate" Card, around line 142–144):

```tsx
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t space-y-2">
```

Replace it with:

```tsx
            </div>

            <div className="mt-4">
              <ShippingEstimate stocks={orderStocks} />
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t space-y-2">
```

- [ ] **Step 4: Verify**

Run: `npm run lint -- src/pages/OrderConfirmation.tsx && npm run build`
Expected: both succeed. If TypeScript complains about `item.snapshot?.items` not being indexable, re-check that `OrderItemSnapshot.items` is declared in `src/types/orders.ts` (the `useOrders.ts:194` snapshot shape confirms it is written to DB).

- [ ] **Step 5: Save point**

Order confirmation page now shows the live aggregate estimate below the items list.

---

## Task 9: Full verification

**Files:** none modified.

- [ ] **Step 1: Final full lint + build**

Run: `npm run lint`
Expected: exits 0 with `--max-warnings 0`.

Run: `npm run build`
Expected: `tsc` passes, `vite build` succeeds.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`
Leave it running on its assigned port (Vite picks 8080 or next available).

- [ ] **Step 3: Manual QA checklist**

Walk through each item with the dev server and a Supabase project that has real data. Mark each with ✅/❌ and note anything unexpected.

1. Open a product with at least one SKU whose `stock > 0`. Select a size. → `🚚 1–3 zile` appears below the price in the "Preț Total" card.
2. Open a product whose *only* available SKU has `stock = 0` (or pick a size with `stock = 0`). → `🚚 7–14 zile` appears.
3. Open the Header cart with no items. → No estimate line in the dropdown.
4. Add one in-stock product to the cart. Open the Header dropdown. → `🚚 1–3 zile` appears above the action buttons.
5. Add a 0-stock item as well. Reopen dropdown. → `🚚 7–14 zile` appears (slowest wins).
6. Navigate to Checkout. → Estimate shows between Transport and Total. Same value as the mini-cart.
7. Build a custom discovery set with all in-stock sub-SKUs. → Cart shows `🚚 1–3 zile`.
8. Swap one sub-SKU of the discovery set for one with `stock = 0`. → Cart flips to `🚚 7–14 zile`.
9. Complete checkout for a valid test order. Land on the confirmation page. → Estimate appears below the items list.
10. Browse `/shop`, home carousels, and any list views. → No estimate badges on cards (per design decision #2).
11. In Supabase, flip a SKU's stock from `5` to `0` while keeping its product open in another tab. Refresh the product page. → Label changes from `1–3` to `7–14 zile` (confirms live computation, not snapshot).
12. Resize the browser to mobile width. Re-check the product page estimate — it must be present in the mobile layout too (Task 5 Step 3).

- [ ] **Step 4: Stop the dev server**

Ctrl-C the running `npm run dev` process.

- [ ] **Step 5: Final save point**

All integration files touched: `Product.tsx`, `Header.tsx`, `Checkout.tsx`, `OrderConfirmation.tsx`. All new files created: `shippingEstimate.ts`, `ShippingEstimate.tsx`, `useSKUStocks.ts`, `ShippingEstimateForCart.tsx`. No DB migrations. No dependency changes. Feature complete.

---

## Self-review notes (plan author)

- **Spec coverage:** Every decision (1–7) in the spec maps to at least one task. Decisions 1 and 7 are implemented structurally (no schema, live query in OrderConfirmation). Decisions 2, 6 are enforced by omission (no list-card touches, no per-line badges). Decisions 3, 4, 5 are delivered in tasks 5–8.
- **Placeholders:** None. Every code step shows full code. The only "find this block / replace with" steps include both the before-text and the after-text in full.
- **Type/name consistency:** `getShippingEstimate`, `ShippingEstimate`, `useSKUStocks`, `collectCartSkuIds`, `ShippingEstimateForCart`, `SHIPPING_COPY`, `IN_STOCK_DAYS`, `BACKORDER_DAYS` — each defined once in its task and used verbatim downstream.
- **Approx line numbers** (`~line 548`, etc.) are given as a locator hint; the *before-text* is the authoritative match target — if the file drifts, the before-block is still the source of truth.
