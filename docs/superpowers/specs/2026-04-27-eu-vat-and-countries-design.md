# EU VAT & Country Expansion — Design

**Date:** 2026-04-27
**Sub-project:** B+C combined (of D → B+C → A roadmap)
**Status:** spec — awaiting review

## Goal

Allow customers from any EU-27 country to place an order, with their country's VAT added on top of the listed (Moldovan) price at the checkout summary. Display an MDL primary total with an approximate EUR estimate in parentheses for non-MD orders.

The order itself continues to be captured in the `orders` table in MDL bani. Payment and logistics are reconciled with the customer via WhatsApp/Telegram (per the project's off-site payment model — see project memory `checkout_offsite_payment.md`).

## Non-goals

- No DB schema changes.
- No online payment integration.
- No per-country shipping rates — flat 50 Lei everywhere for now.
- No VAT on shipping (subtotal only).
- No snapshotting of VAT rate / FX rate per order.
- No order-confirmation page VAT breakdown.
- No admin UI for editing VAT rates — hardcoded constants.
- No live country detection (geo-IP / browser locale). Customer picks country at checkout.
- No countries outside MD + EU-27. The country dropdown is intentionally restricted.

## Decisions captured

| # | Decision | Rationale |
|---|---|---|
| 1 | Listed prices are unchanged; VAT is **added on top** for non-MD customers | "Tourist pricing" is simpler than swapping MD VAT for the buyer's VAT |
| 2 | MD customers' flow unchanged (15% reverse-calc, "Inclusiv … din taxe" footnote stays) | Don't disrupt the existing customer base |
| 3 | VAT row appears only in the checkout summary, after the country is selected | Matches off-site-payment expectations; minimal blast radius across the site |
| 4 | Currency stays MDL; EUR shown in parens as an estimate | Order amounts of record stay MDL; EUR is advisory only |
| 5 | Hardcoded VAT table + live FX API with hardcoded fallback | Off-site reconciliation makes near-real-time accuracy non-critical |
| 6 | Scope limited to EU-27 (no UK, EEA, Switzerland, etc.) | Smaller country list, simpler tax rules — every entry has a real EU VAT rate |
| 7 | Flat 50 Lei shipping for all 28 countries | Revisit when EU orders start eating margin |
| 8 | VAT applies to subtotal only, not shipping | Off-site chat handles small reconciliations; keeps `calculateTotals` simple |
| 9 | Order's `total_bani` includes VAT (subtotal + shipping + VAT) | Seller sees the actual amount they're collecting from this customer |

## Architecture

### New files

**`src/utils/vat.ts`** — pure constants and math.

```ts
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

// Used when the live FX call fails. Approximate, not authoritative.
export const MDL_PER_EUR_FALLBACK = 19.5;

/** VAT amount in bani. Returns 0 for MD or any unknown country code. */
export function calculateVatBani(subtotalBani: number, country: string): number {
  const rate = EU_VAT_RATES[country as EuCountryCode];
  if (!rate) return 0;
  return Math.round(subtotalBani * rate);
}

/** VAT rate as a decimal (e.g. 0.19) or null if not an EU-27 country. */
export function getVatRate(country: string): number | null {
  return EU_VAT_RATES[country as EuCountryCode] ?? null;
}
```

**`src/hooks/useFxRate.ts`** — async, cached.

```ts
import { useQuery } from '@tanstack/react-query';
import { MDL_PER_EUR_FALLBACK } from '@/utils/vat';

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

### Modified file

**`src/pages/Checkout.tsx`** — three small edits:

**Edit 1: country dropdown** (~line 339).
Replace the single `<SelectItem value="MD">Republica Moldova</SelectItem>` with MD plus a `.map()` over `EU_COUNTRY_LABELS`. EU entries appear after MD, sorted by Romanian label (alphabetical sort applied at render time, not in the constants object — keeps the constants object readable).

**Edit 2: `calculateTotals()`** (~line 86).
Add VAT into the math:

```ts
const calculateTotals = () => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * 100 * item.quantity,
    0,
  );
  const shipping = checkoutState.shippingMethod.price;
  const country = checkoutState.shippingAddress.country;
  const vat = calculateVatBani(subtotal, country);
  const total = subtotal + shipping + vat;
  const taxIncluded = country === 'MD'
    ? Math.round(total * (TAX_RATE / (1 + TAX_RATE)))
    : 0;
  return { subtotal, shipping, vat, total, taxIncluded };
};
```

`taxIncluded` is forced to 0 for non-MD so the "Inclusiv … din taxe" footnote naturally hides (gated by `taxIncluded > 0` in the render).

**Edit 3: summary card JSX** (~line 573).
Insert a VAT row between the Shipping row and the Total separator, conditionally rendered when `country !== 'MD'`. Add EUR-in-parens to the Total row, conditionally rendered when `country !== 'MD'`. Hide the "Inclusiv … din taxe" footnote when `taxIncluded === 0`.

Pseudocode for the new fragment:

```tsx
{country !== 'MD' && (
  <div className="flex justify-between text-sm mb-4">
    <span className="text-muted-foreground">
      TVA {EU_COUNTRY_LABELS[country]} ({(getVatRate(country)! * 100).toFixed(0)}%)
    </span>
    <span className="font-medium">{formatCheckoutPrice(totals.vat)}</span>
  </div>
)}
```

```tsx
{/* Total row */}
<div className="text-2xl font-bold">
  {formatCheckoutPrice(totals.total)}
</div>
{country !== 'MD' && (
  <div className="text-xs text-muted-foreground mt-1">
    ≈ €{(totals.total / 100 / mdlPerEur).toFixed(2)}
  </div>
)}
```

`mdlPerEur` comes from `useFxRate()` called once near the top of the component.

### Order creation

`useCreateOrder` already computes `total_bani = subtotal_bani + shippingCost`. Update the call site so `subtotal_bani` is the raw subtotal and `shippingCost` continues to be the flat 50 Lei — but pass through the **VAT-included total** as `total_bani`. Two options for how this propagates:

**Option α (preferred):** Adapt the call site so what's passed as `shippingCost` to `useCreateOrder` is `shipping + vat`. The mutation hook stays untouched. `orders.shipping_bani` ends up holding `shipping + vat` for non-MD orders — slightly inaccurate label-wise but no schema change and the seller knows from `country` what's going on.

**Option β:** Modify `useCreateOrder` to accept a fourth arg `vatCost` and add it into `total_bani` separately. Cleaner data, +5 lines of code in `useOrders.ts`.

Spec choice: **Option β** — it's a small, focused change in one file, doesn't muddy `shipping_bani`, and writing-plans can produce it deterministically. We document it but keep the public API signature minimal.

Updated signature:
```ts
useCreateOrder().mutate({
  input,
  cartItems,
  shippingCost,   // 50 Lei flat, MDL bani
  vatCost,        // calculateVatBani(subtotal, country); 0 for MD
})
```

`total_bani = subtotal_bani + shippingCost + vatCost`.

## UX flow — three summary states

### State 1: country = MD (unchanged)
```
Subtotal · 2 articole          1000 Lei
Transport                        50 Lei
─────────────────────────────────
Total                          1050 Lei
                              MDL
                  Inclusiv 130.43 Lei din taxe
```

### State 2: country = DE (any EU-27)
```
Subtotal · 2 articole          1000 Lei
Transport                        50 Lei
TVA Germania (19%)              190 Lei
─────────────────────────────────
Total                          1240 Lei
                              MDL · ≈ €63.59
```

### State 3: FX API failed
Identical to State 2; the EUR estimate uses `MDL_PER_EUR_FALLBACK = 19.5`. `useFxRate.isLive` is `false` but not surfaced in UI.

## Edge cases

| Case | Behavior |
|---|---|
| Country = MD | Existing flow preserved exactly. VAT row hidden. "Inclusiv … din taxe" shown |
| Country = EU-27 | VAT row shown. EUR estimate on Total. "Inclusiv" footnote hidden |
| Country = unknown / stale value in localStorage | `calculateVatBani` returns 0; customer effectively sees the MD flow. Safe degrade |
| FX API down or blocked | `useFxRate` falls back to `MDL_PER_EUR_FALLBACK`. EUR estimate still rendered, no toast |
| FX API returns malformed JSON | Caught by validation in `useFxRate`'s queryFn → fallback engaged |
| User changes country mid-checkout | Totals recompute on every render; VAT row appears/disappears live |
| User reloads checkout with EU country in localStorage | Brief fallback-rate render (~200ms) until React Query resolves the live rate. Acceptable |
| User in MD selects DE for shipping | They pay the elevated EU price. Country drives VAT regardless of where they actually live |
| EU rate changes after deploy | Code change required. Frequency 0–2/year/country. Acceptable for MVP |
| FX rate fluctuates between checkout and chat | EUR is advisory; seller confirms in chat. No issue |

## Testing

No test runner. Manual QA checklist:

1. Country = MD → existing UI exactly preserved. VAT row not present. "Inclusiv … din taxe" footnote present.
2. Country = DE → VAT row appears: "TVA Germania (19%): 190 Lei" (for a 1000-Lei subtotal). Total = 1240 Lei. EUR-in-parens shown.
3. Country = HU → 27% rate applied (highest EU rate). Sanity check.
4. Country = LU → 17% rate (lowest EU rate). Sanity check.
5. Switch country MD → DE → HU → MD → totals recompute each time, no stale numbers.
6. EUR-in-parens visible only for non-MD; hidden for MD.
7. "Inclusiv din taxe" footnote visible only for MD; hidden for non-MD.
8. Submit an order with country = DE → confirmation page loads, `orders.total_bani` reflects subtotal + shipping + VAT, `orders.shipping_address.country = 'DE'`.
9. Block `api.exchangerate.host` in browser devtools → reload → EUR estimate still appears using the fallback rate (≈ €X based on 19.5 MDL/EUR).
10. Country dropdown contains exactly 28 entries (MD + EU-27), sorted: MD first, then EU-27 alphabetical by Romanian label.

## Forward compatibility

- **i18n (sub-project A):** `EU_COUNTRY_LABELS` is the swap point for country names. The "TVA <Country> (X%)" template string lives inline in `Checkout.tsx` for now and will be extracted by sub-project A — flagged.
- **Online payment (future):** Adding Stripe/etc. would require schema additions to snapshot VAT rate, FX rate, EUR total per order. Today's design deliberately avoids those columns since they're unnecessary in the off-site model.
- **Per-country shipping (future):** When you're ready, replace the flat `shippingMethod.price = 5000` with a `getShippingBani(country)` lookup keyed off the same `EU_COUNTRY_LABELS` set. No DB change needed.

## Out of scope / follow-ups

- Geo-IP country pre-selection — manual selection only
- Multi-currency storage in `orders` — stays MDL
- Order-confirmation page VAT line — left to a later micro-task if desired
- Admin UI for VAT rate editing — hardcoded for now, easy to upgrade
- Telegram/WhatsApp notification on order placement — separate sub-project
