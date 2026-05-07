# EU VAT & Country Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow customers from any EU-27 country to order; for non-MD orders, add country VAT on top of the listed price at checkout and show an EUR estimate alongside the MDL total.

**Architecture:** Two new small modules — `src/utils/vat.ts` (constants + pure math) and `src/hooks/useFxRate.ts` (live FX with hardcoded fallback) — plus targeted edits to `src/pages/Checkout.tsx` (country dropdown, totals, summary JSX) and `src/hooks/useOrders.ts` (mutation accepts a `vatCost` param so the stored `total_bani` reflects VAT).

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, `@tanstack/react-query`, Supabase JS.

**Environment notes:**
- No test runner. Verification gate per task = `npm run build` (runs `tsc && vite build`). Manual QA at the end (Task 5).
- Project's ESLint config is pre-broken (extends `next/core-web-vitals` despite Vite/React stack). Skipping `npm run lint` everywhere; not in scope.
- Directory is not a git repo. No `git commit` steps. Save points = "build is green and tree is clean."
- Path alias `@/*` → `src/*`.
- UI copy is Romanian. Strings live in constants where possible to keep sub-project A (i18n) cheap.

**Spec:** `docs/superpowers/specs/2026-04-27-eu-vat-and-countries-design.md`

---

## File Structure

**Create (2 files):**
- `src/utils/vat.ts` — `EuCountryCode` type, `EU_VAT_RATES`, `EU_COUNTRY_LABELS`, `calculateVatBani`, `getVatRate`
- `src/hooks/useFxRate.ts` — `useFxRate()` returning `{ mdlPerEur, isLive }`, with React Query cache + hardcoded fallback (constant defined locally)

**Modify (2 files):**
- `src/hooks/useOrders.ts` — `useCreateOrder` accepts a `vatCost` parameter; `total_bani` becomes `subtotal_bani + shippingCost + vatCost`
- `src/pages/Checkout.tsx` — country dropdown expanded to MD + EU-27, `calculateTotals()` includes VAT, summary JSX adds VAT row + EUR estimate, "Inclusiv din taxe" footnote gated to MD only, `createOrder` call site passes `vatCost`

---

## Task 1: VAT data + math module

**Files:**
- Create: `src/utils/vat.ts`

- [ ] **Step 1: Create the file**

Create `src/utils/vat.ts` with exactly this content:

```ts
// EU VAT data and pure math. All copy lives here so sub-project A (i18n)
// has a single swap point.

export type EuCountryCode =
  | 'AT' | 'BE' | 'BG' | 'CY' | 'CZ' | 'DE' | 'DK' | 'EE' | 'ES' | 'FI'
  | 'FR' | 'GR' | 'HR' | 'HU' | 'IE' | 'IT' | 'LT' | 'LU' | 'LV' | 'MT'
  | 'NL' | 'PL' | 'PT' | 'RO' | 'SE' | 'SI' | 'SK';

// Standard VAT rates as of 2026. Verify before deploy. Update when rates change.
export const EU_VAT_RATES: Record<EuCountryCode, number> = {
  AT: 0.20, BE: 0.21, BG: 0.20, CY: 0.19, CZ: 0.21, DE: 0.19, DK: 0.25,
  EE: 0.22, ES: 0.21, FI: 0.255, FR: 0.20, GR: 0.24, HR: 0.25, HU: 0.27,
  IE: 0.23, IT: 0.22, LT: 0.21, LU: 0.17, LV: 0.21, MT: 0.18, NL: 0.21,
  PL: 0.23, PT: 0.23, RO: 0.19, SE: 0.25, SI: 0.22, SK: 0.23,
};

// Romanian labels for the checkout country dropdown.
export const EU_COUNTRY_LABELS: Record<EuCountryCode, string> = {
  AT: 'Austria',     BE: 'Belgia',    BG: 'Bulgaria',   CY: 'Cipru',
  CZ: 'Cehia',       DE: 'Germania',  DK: 'Danemarca',  EE: 'Estonia',
  ES: 'Spania',      FI: 'Finlanda',  FR: 'Franța',     GR: 'Grecia',
  HR: 'Croația',     HU: 'Ungaria',   IE: 'Irlanda',    IT: 'Italia',
  LT: 'Lituania',    LU: 'Luxemburg', LV: 'Letonia',    MT: 'Malta',
  NL: 'Olanda',      PL: 'Polonia',   PT: 'Portugalia', RO: 'România',
  SE: 'Suedia',      SI: 'Slovenia',  SK: 'Slovacia',
};

/** VAT amount in bani. Returns 0 for MD or any non-EU-27 country. */
export function calculateVatBani(subtotalBani: number, country: string): number {
  const rate = EU_VAT_RATES[country as EuCountryCode];
  if (rate === undefined) return 0;
  return Math.round(subtotalBani * rate);
}

/** VAT rate as a decimal (e.g. 0.19) or null if not an EU-27 country. */
export function getVatRate(country: string): number | null {
  return EU_VAT_RATES[country as EuCountryCode] ?? null;
}
```

Sanity facts (don't include in the file):
- 27 entries in both `EU_VAT_RATES` and `EU_COUNTRY_LABELS`. The two records' keys must match exactly — TypeScript's `Record<EuCountryCode, …>` enforces this at compile time.
- `FI: 0.255` is Finland's 25.5% standard rate (in effect since Sept 2024).
- Function names are referenced verbatim by Task 4. Do not rename.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: `tsc` passes, `vite build` succeeds. If `tsc` complains about a missing key in either Record, count the entries — both must be exactly 27.

- [ ] **Step 3: Save point**

File is self-contained. No callers yet.

---

## Task 2: FX rate hook

**Files:**
- Create: `src/hooks/useFxRate.ts`

- [ ] **Step 1: Create the file**

Create `src/hooks/useFxRate.ts` with exactly this content:

```ts
import { useQuery } from '@tanstack/react-query';

// Used when the live FX call fails. Approximate, not authoritative.
const MDL_PER_EUR_FALLBACK = 19.5;

/**
 * MDL per 1 EUR. Cached for 24h. On any failure, returns the hardcoded fallback.
 * `isLive` is true when the value comes from the API; false when it's the fallback.
 */
export function useFxRate(): { mdlPerEur: number; isLive: boolean } {
  const { data, isError } = useQuery({
    queryKey: ['fx-mdl-eur'],
    queryFn: async (): Promise<number> => {
      const res = await fetch(
        'https://api.exchangerate.host/latest?base=EUR&symbols=MDL',
      );
      const json = await res.json();
      const rate = json?.rates?.MDL;
      if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
        throw new Error('Invalid FX response');
      }
      return rate;
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  return {
    mdlPerEur: data ?? MDL_PER_EUR_FALLBACK,
    isLive: !isError && typeof data === 'number',
  };
}
```

Notes:
- Imports from `@/utils/vat` so the fallback constant has a single source of truth.
- `staleTime` and `gcTime` both 24h — once fetched, cached for the day.
- `retry: 1` — one retry attempt on network blip; after that, errors flow into the fallback path.
- React Query already wraps the app in `QueryClientProvider` (see `src/App.tsx`), so this hook works anywhere inside the tree.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Save point**

Hook is self-contained. No callers yet.

---

## Task 3: Add `vatCost` parameter to `useCreateOrder`

**Files:**
- Modify: `src/hooks/useOrders.ts:90-130`

The mutation already accepts `{ input, cartItems, shippingCost }` and computes `total_bani = subtotal_bani + shippingCost`. We add a fourth parameter `vatCost` (defaults to 0 for backward compatibility / safety) and include it in the total.

- [ ] **Step 1: Update the mutation signature and body**

Find this block in `src/hooks/useOrders.ts`:

```ts
  return useMutation({
    mutationFn: async ({
      input,
      cartItems,
      shippingCost
    }: {
      input: CreateOrderInput;
      cartItems: CartItem[];
      shippingCost: number;
    }) => {
      // Calculate totals
      const subtotal_bani = cartItems.reduce((sum, item) => {
        return sum + (item.price * 100 * item.quantity);
      }, 0);
      
      const total_bani = subtotal_bani + shippingCost;
```

Replace it with:

```ts
  return useMutation({
    mutationFn: async ({
      input,
      cartItems,
      shippingCost,
      vatCost = 0
    }: {
      input: CreateOrderInput;
      cartItems: CartItem[];
      shippingCost: number;
      vatCost?: number;
    }) => {
      // Calculate totals
      const subtotal_bani = cartItems.reduce((sum, item) => {
        return sum + (item.price * 100 * item.quantity);
      }, 0);
      
      const total_bani = subtotal_bani + shippingCost + vatCost;
```

The default `vatCost = 0` keeps existing behavior for any current callers and for MD orders.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds. `tsc` may briefly flag the existing `Checkout.tsx` call site as "ok" (it doesn't pass `vatCost`, but the parameter is optional). That's expected — Task 4 will update the call site.

- [ ] **Step 3: Save point**

Mutation now accepts `vatCost`. No call sites updated yet — that happens in Task 4.

---

## Task 4: Wire VAT through Checkout.tsx

**Files:**
- Modify: `src/pages/Checkout.tsx` (5 separate edits)

Five distinct edits in this single file. Apply in order.

- [ ] **Step 1: Add imports**

Find this block at the top of `src/pages/Checkout.tsx` (around line 16–18):

```tsx
import { Info, Lock, ShoppingBag } from "lucide-react";
import { formatCheckoutPrice } from "@/utils/formatCheckoutPrice";
import { ShippingEstimateForCart } from "@/components/ShippingEstimateForCart";
```

Replace with:

```tsx
import { Info, Lock, ShoppingBag } from "lucide-react";
import { formatCheckoutPrice } from "@/utils/formatCheckoutPrice";
import { ShippingEstimateForCart } from "@/components/ShippingEstimateForCart";
import {
  EU_COUNTRY_LABELS,
  type EuCountryCode,
  calculateVatBani,
  getVatRate,
} from "@/utils/vat";
import { useFxRate } from "@/hooks/useFxRate";
```

- [ ] **Step 2: Call `useFxRate` once near the top of the component**

Find this block (around line 39):

```tsx
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const { toast } = useToast();
```

Replace with:

```tsx
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const { toast } = useToast();
  const { mdlPerEur } = useFxRate();
```

The hook must run unconditionally on every render (Rules of Hooks).

- [ ] **Step 3: Update `calculateTotals()` to include VAT**

Find this block (around line 85–102):

```tsx
  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = item.price * 100; // Convert Lei to bani
      return sum + (itemPrice * item.quantity);
    }, 0);

    const shipping = checkoutState.shippingMethod.price;
    const total = subtotal + shipping;
    const taxIncluded = Math.round(total * (TAX_RATE / (1 + TAX_RATE)));

    return {
      subtotal,
      shipping,
      total,
      taxIncluded
    };
  };
```

Replace with:

```tsx
  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = item.price * 100; // Convert Lei to bani
      return sum + (itemPrice * item.quantity);
    }, 0);

    const shipping = checkoutState.shippingMethod.price;
    const country = checkoutState.shippingAddress.country;
    const vat = calculateVatBani(subtotal, country);
    const total = subtotal + shipping + vat;
    // "Inclusiv … din taxe" footnote applies to MD only; non-MD shows an
    // explicit VAT row instead, so taxIncluded must be 0 there to hide it.
    const taxIncluded = country === 'MD'
      ? Math.round(total * (TAX_RATE / (1 + TAX_RATE)))
      : 0;

    return {
      subtotal,
      shipping,
      vat,
      total,
      taxIncluded
    };
  };
```

- [ ] **Step 4: Expand the country dropdown**

Find this block (around line 338–340):

```tsx
                      <SelectContent>
                        <SelectItem value="MD">Republica Moldova</SelectItem>
                      </SelectContent>
```

Replace with:

```tsx
                      <SelectContent>
                        <SelectItem value="MD">Republica Moldova</SelectItem>
                        {(Object.entries(EU_COUNTRY_LABELS) as [EuCountryCode, string][])
                          .sort((a, b) => a[1].localeCompare(b[1], 'ro'))
                          .map(([code, label]) => (
                            <SelectItem key={code} value={code}>
                              {label}
                            </SelectItem>
                          ))}
                      </SelectContent>
```

The `as [EuCountryCode, string][]` cast narrows `Object.entries`'s default `[string, string][]` return type. The Romanian-locale sort puts `Croația` after `Cipru` etc., consistent with how the labels read in the dropdown.

- [ ] **Step 5: Update the summary card JSX (VAT row, EUR estimate, footnote gating)**

Find this block (around line 583–605):

```tsx
                  <div className="mb-4">
                    <ShippingEstimateForCart />
                  </div>

                  <Separator className="my-4" />

                  {/* Total */}
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-lg font-semibold">Total</span>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">MDL</div>
                      <div className="text-2xl font-bold">
                        {formatCheckoutPrice(totals.total)}
                      </div>
                    </div>
                  </div>

                  {/* Tax Included */}
                  <p className="text-xs text-muted-foreground text-right">
                    Inclusiv {formatCheckoutPrice(totals.taxIncluded)} din taxe
                  </p>
```

Replace with:

```tsx
                  {checkoutState.shippingAddress.country !== 'MD' && (
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-muted-foreground">
                        TVA {EU_COUNTRY_LABELS[checkoutState.shippingAddress.country as EuCountryCode] ?? ''} ({Math.round((getVatRate(checkoutState.shippingAddress.country) ?? 0) * 100)}%)
                      </span>
                      <span className="font-medium">
                        {formatCheckoutPrice(totals.vat)}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <ShippingEstimateForCart />
                  </div>

                  <Separator className="my-4" />

                  {/* Total */}
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-lg font-semibold">Total</span>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">
                        MDL{checkoutState.shippingAddress.country !== 'MD' && (
                          <> · ≈ €{(totals.total / 100 / mdlPerEur).toFixed(2)}</>
                        )}
                      </div>
                      <div className="text-2xl font-bold">
                        {formatCheckoutPrice(totals.total)}
                      </div>
                    </div>
                  </div>

                  {/* Tax Included — MD only */}
                  {totals.taxIncluded > 0 && (
                    <p className="text-xs text-muted-foreground text-right">
                      Inclusiv {formatCheckoutPrice(totals.taxIncluded)} din taxe
                    </p>
                  )}
```

Notes:
- The VAT row sits between Shipping and `ShippingEstimateForCart`. Visual order in the summary becomes: Subtotal → Transport → TVA (if non-MD) → ShippingEstimate → Separator → Total.
- `Math.round(rate * 100)` displays integer percent (19, 20, 21, etc.). For Finland (FI: 0.255) this rounds to 26 — acceptable rough display. If you need decimal precision (e.g. "25.5%"), change to `(rate * 100).toFixed(1).replace(/\.0$/, '')` later.
- The `EU_COUNTRY_LABELS[…] ?? ''` and `getVatRate(…) ?? 0` defenses cover the (impossible-by-design) case where `country` is a non-MD value not in the EU-27 list.

- [ ] **Step 6: Pass `vatCost` to `createOrder`**

Find this block (around line 246–250):

```tsx
    createOrder({
      input: orderInput,
      cartItems: items,
      shippingCost: checkoutState.shippingMethod.price
    }, {
```

Replace with:

```tsx
    createOrder({
      input: orderInput,
      cartItems: items,
      shippingCost: checkoutState.shippingMethod.price,
      vatCost: totals.vat
    }, {
```

`totals.vat` is now exposed by `calculateTotals()` (Step 3). For MD it's 0, so no behavioral change for existing customers.

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: build succeeds. If `tsc` complains about `totals.vat` being undefined, re-check that Step 3 added `vat` to the returned object.

- [ ] **Step 8: Save point**

Checkout fully integrates VAT and EUR display.

---

## Task 5: Full verification

**Files:** none modified.

- [ ] **Step 1: Final build**

Run: `npm run build`
Expected: `tsc` passes, `vite build` succeeds.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`
Vite starts on the first available port (5173 by default).

- [ ] **Step 3: Manual QA checklist**

Walk through each item with the dev server. Mark each ✅/❌.

1. Navigate to checkout with at least one item in the cart. Country defaults to MD (Republica Moldova). Summary shows Subtotal, Transport, ShippingEstimate, Total, "Inclusiv … din taxe" line. **No** TVA row, **no** EUR estimate.
2. Open the country dropdown. Confirm 28 entries: MD at top, then 27 EU countries sorted by Romanian label (Austria, Belgia, Bulgaria, Cehia, Cipru, Croația, Danemarca, Estonia, Finlanda, Franța, Germania, Grecia, Irlanda, Italia, Letonia, Lituania, Luxemburg, Malta, Olanda, Polonia, Portugalia, România, Slovacia, Slovenia, Spania, Suedia, Ungaria).
3. Select **Germania**. Summary updates: TVA row appears showing "TVA Germania (19%): X Lei" where X = subtotal × 0.19. Total = subtotal + 50 + X. EUR estimate shown next to "MDL" label. "Inclusiv din taxe" footnote disappears.
4. Select **Ungaria** (HU). VAT row shows "TVA Ungaria (27%)" — highest rate. Sanity check.
5. Select **Luxemburg** (LU). VAT row shows "TVA Luxemburg (17%)" — lowest rate. Sanity check.
6. Select **Finlanda** (FI). VAT row shows "TVA Finlanda (26%)" (rounded from 25.5%). Acceptable display rounding.
7. Switch country MD → DE → HU → MD. Each switch updates totals; no stale numbers.
8. EUR-in-parens visible only for non-MD; hidden for MD.
9. With country = DE, click "Plasează comanda". Order is created. Confirmation page loads. The DB row in `orders` has `total_bani` = subtotal + 50 (shipping in bani) + VAT in bani; `shipping_address.country = 'DE'`.
10. With country = MD, place an order — `total_bani` = subtotal + shipping (no VAT). Same as before this change.
11. In browser devtools, block requests to `api.exchangerate.host`. Reload checkout. Pick Germania. EUR estimate still appears (using fallback rate of 19.5 MDL/EUR). No error toast.
12. With network blocked, no console error toast or visible spinner — only the React Query background warning is acceptable.

- [ ] **Step 4: Stop the dev server**

Ctrl-C the running `npm run dev` process.

- [ ] **Step 5: Final save point**

Files created: `src/utils/vat.ts`, `src/hooks/useFxRate.ts`. Files modified: `src/hooks/useOrders.ts`, `src/pages/Checkout.tsx`. No DB migrations. No dependency changes.

---

## Self-review notes (plan author)

- **Spec coverage:** Each of the 9 captured decisions maps to a task. Decisions 1, 2, 3, 9 → Task 4 (Checkout integration). Decisions 4, 5 → Task 4 (EUR-in-parens) + Task 2 (useFxRate). Decision 6 → Task 1 (27-entry tables). Decisions 7, 8 → no work needed (flat shipping unchanged, VAT applied only to subtotal in Task 4 Step 3).
- **Placeholders:** None. Every code-changing step shows the full before-block and after-block.
- **Type/name consistency:** `EU_VAT_RATES`, `EU_COUNTRY_LABELS`, `MDL_PER_EUR_FALLBACK`, `calculateVatBani`, `getVatRate`, `EuCountryCode`, `useFxRate` — defined in Tasks 1–2, used verbatim in Tasks 3–4.
- **Hook placement:** `useFxRate()` is called unconditionally in Task 4 Step 2 (top of component, before any early return). Consistent with React Rules of Hooks.
- **`vatCost` default:** Task 3's `vatCost = 0` default means the parameter is optional, so the build doesn't break between Task 3 and Task 4. Order matters; do not reorder these tasks.
