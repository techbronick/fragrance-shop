# Shipping Estimate — Design

**Date:** 2026-04-21
**Sub-project:** D (of D → B+C → A roadmap)
**Status:** spec — awaiting review

## Goal

Show users a shipping-time estimate on every surface where the decision to buy is relevant: product page, cart (Header dropdown), checkout, and order confirmation.

- In-stock SKU (`skus.stock > 0`) → **1–3 zile**
- Backorder SKU (`skus.stock = 0`) → **7–14 zile**
- Mixed cart → slowest wins (single aggregate estimate)

## Non-goals

- No new DB columns. Status is fully derived from the existing `skus.stock` field.
- No list-card badges (kept off to avoid UI noise). Estimate only appears once a SKU is selected.
- No per-line badges in cart/checkout. Aggregate only.
- No email changes. Order-confirmation **page** only.
- No admin override UI. If the shop wants to flag a stocked item as backorder, that's a later decision.
- No split shipments. The estimate assumes the whole order ships together.

## Decisions captured

| # | Decision | Rationale |
|---|---|---|
| 1 | Status derived from `skus.stock` — no new schema | Fewer moving parts; admin already maintains stock |
| 2 | No list-card badges | User asked to keep cards clean; estimate only matters after SKU pick |
| 3 | Show on product page, cart dropdown, checkout, order confirmation page | Full journey coverage |
| 4 | Mixed cart → slowest wins | Matches "ship when all items ready" fulfilment |
| 5 | Compact visual: `🚚 1–3 zile` / `🚚 7–14 zile` | Minimal, non-alarming, fits existing UI density |
| 6 | Aggregate only in cart/checkout (no per-line) | Cleaner UI; user can infer cause from item stock states on product page |
| 7 | Order confirmation uses **live** stock at render time, not a snapshot | Simpler; estimate is informational, not a promise |

## Architecture

### New files

**`src/utils/shippingEstimate.ts`** — pure logic + constants.

```ts
export const IN_STOCK_DAYS  = { minDays: 1, maxDays: 3 } as const;
export const BACKORDER_DAYS = { minDays: 7, maxDays: 14 } as const;

export const SHIPPING_COPY = {
  // Romanian — swap point for sub-project A (i18n)
  inStock:   'În stoc',
  backorder: 'La comandă',
  daysUnit:  'zile',
  prefix:    '🚚',
} as const;

export type ShippingEstimate =
  | { type: 'in_stock';  minDays: number; maxDays: number }
  | { type: 'backorder'; minDays: number; maxDays: number };

/**
 * Returns null if no stocks provided (caller renders nothing).
 * Otherwise returns the aggregate estimate — slowest wins.
 */
export function getShippingEstimate(stocks: number[]): ShippingEstimate | null {
  if (stocks.length === 0) return null;
  const anyOutOfStock = stocks.some(s => s <= 0);
  return anyOutOfStock
    ? { type: 'backorder', ...BACKORDER_DAYS }
    : { type: 'in_stock',  ...IN_STOCK_DAYS };
}
```

**`src/components/ShippingEstimate.tsx`** — presentational.

```tsx
type Props = { stocks: number[] };

export function ShippingEstimate({ stocks }: Props) {
  const est = getShippingEstimate(stocks);
  if (!est) return null;
  return (
    <div className="text-sm text-muted-foreground">
      {SHIPPING_COPY.prefix} {est.minDays}–{est.maxDays} {SHIPPING_COPY.daysUnit}
    </div>
  );
}
```

**`src/hooks/useSKUStocks.ts`** — batch fetch for cart/checkout/order contexts where only `skuId` is available.

```ts
export function useSKUStocks(skuIds: string[]) {
  const sortedIds = [...skuIds].sort();   // stable cache key
  return useQuery({
    queryKey: ['sku-stocks', sortedIds],
    queryFn: async () => {
      if (sortedIds.length === 0) return [];
      const { data, error } = await supabase
        .from('skus')
        .select('id, stock')
        .in('id', sortedIds);
      if (error) throw error;
      const byId = new Map((data ?? []).map(r => [r.id, r.stock]));
      // Missing SKU → 0 stock → pushes aggregate to backorder (safer)
      return sortedIds.map(id => byId.get(id) ?? 0);
    },
    enabled: sortedIds.length > 0,
  });
}
```

**`src/components/ShippingEstimateForCart.tsx`** — convenience wrapper used in both Header mini-cart and Checkout.

```tsx
export function ShippingEstimateForCart() {
  const { items } = useCart();
  const skuIds = collectCartSkuIds(items);      // includes bundle sub-SKUs
  const { data: stocks = [] } = useSKUStocks(skuIds);
  return <ShippingEstimate stocks={stocks} />;
}
```

Helper `collectCartSkuIds(items)` lives alongside and handles the bundle case (flattens `selectedItems[].sku_id`).

## Integration points

| Location | Change |
|---|---|
| `src/pages/Product.tsx` | `<ShippingEstimate stocks={[selectedSku.stock]} />` placed near price / under SKU selector |
| `src/components/Header.tsx` (mini-cart dropdown) | `<ShippingEstimateForCart />` inserted in the cart preview footer, above the "Mergi la checkout" button |
| `src/pages/Checkout.tsx` | `<ShippingEstimateForCart />` inserted in the order summary panel, near the total |
| `src/pages/OrderConfirmation.tsx` | Custom wrapper passing `order.items[*].skuId` through `useSKUStocks` → `<ShippingEstimate />`, below the items list |

No changes to `ProductCard.tsx`, `ProductListCard.tsx`, or carousels.

## Data flow

```
Product page:
  Product.tsx → selectedSku (already in state) → ShippingEstimate

Mini-cart / Checkout:
  useCart() → items → collectCartSkuIds() → useSKUStocks() → live stock[] → ShippingEstimate

Order confirmation:
  useOrders() → order.items → skuIds → useSKUStocks() → live stock[] → ShippingEstimate
```

All non-product-page surfaces rely on a single Supabase query (`skus.select('id, stock').in('id', …)`) cached by React Query on sorted skuId keys.

## Edge cases

| Case | Behavior |
|---|---|
| `stocks = []` (empty cart, no SKU selected) | Component renders nothing |
| `useSKUStocks` loading | Render nothing — no skeleton (secondary info; avoid layout shift) |
| `useSKUStocks` error | Render nothing, `console.error`. Non-essential info must never block or show error UI |
| SKU not found (stale cart referencing deleted SKU) | Query returns fewer rows than skuIds — treat missing as backorder (safer) |
| Cart has only predefined bundles (no `selectedItems`) | Treated as in-stock (pre-assembled product) |
| Mixed: in-stock item + 0-stock bundle sub-SKU | Aggregate → 7–14 zile (slowest wins) |
| Product page — no SKU selected yet | Render nothing until user picks a size |
| Stock changes between page view and checkout | Each surface queries live; user sees current estimate |
| Order placed, stock subsequently flipped | Order confirmation shows current estimate per decision #7 |

## Testing

No test runner is configured in this repo (per `CLAUDE.md`). Delivery must be verified via a manual QA checklist:

1. Open a product with an in-stock SKU, select it → `🚚 1–3 zile` appears
2. Open a product whose only SKU has `stock = 0` → `🚚 7–14 zile` appears
3. Empty cart, open Header dropdown → no estimate line
4. Add one in-stock item → mini-cart and checkout show `🚚 1–3 zile`
5. Add one 0-stock item → both show `🚚 7–14 zile`
6. Mixed cart (one of each) → both show `🚚 7–14 zile`
7. Discovery set with all in-stock sub-SKUs → `🚚 1–3 zile`
8. Discovery set with one 0-stock sub-SKU → `🚚 7–14 zile`
9. Place an order, visit its confirmation page → estimate shown
10. List pages (`/shop`, carousels on home) → no estimate badges anywhere
11. Flip a SKU from stock=5 to stock=0 in DB; refresh product page → label changes from 1–3 to 7–14

## Forward compatibility

- **i18n (sub-project A):** all user-facing strings live in `SHIPPING_COPY` in `shippingEstimate.ts`. Swap point is a single module — no JSX to touch.
- **EU shipping (sub-project B+C):** `getShippingEstimate()` can accept an optional `country` later (e.g. `getShippingEstimate(stocks, { country: 'RO' })`) to vary thresholds without breaking existing callers. Not building it now.

## Out of scope / follow-ups

- Stock reservation on cart add — orthogonal to this work
- Backorder pre-order UX distinction (deposit, confirmation email, etc.) — business decision
- Real-time stock updates (Supabase realtime) — overkill for this surface
- Admin override flag on a SKU ("say 7–14 even if stock>0") — not requested
