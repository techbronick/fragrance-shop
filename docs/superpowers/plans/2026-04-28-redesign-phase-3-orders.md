# Redesign Phase 3 — Order pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `/orders/:orderId` to a single-page Phase-2-styled detail surface with a `?placed=1` celebration mode, cut the customer-facing `/orders` history list, and update Checkout to redirect with the celebration param.

**Architecture:** One file rewrite (`OrderConfirmation.tsx`), one one-line change (`Checkout.tsx`), one App.tsx route removal, one file deletion (`Orders.tsx`). No new files, no new components, no new hooks.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, shadcn/Radix, `@tanstack/react-query`, Supabase JS. Phase 1 design tokens, Phase 2 patterns, sub-project D ShippingEstimate, sub-project B+C VAT/EUR estimate logic — all reused.

**Spec:** `docs/superpowers/specs/2026-04-28-redesign-phase-3-orders-design.md`

**Environment notes:**
- No test runner. Verification = `npm run build`.
- ESLint pre-broken — skip `npm run lint`.
- Not a git repo. No commits.
- User runs manual QA themselves; final task is build verify only.
- Romanian diacritics required throughout.

---

## File structure

**Modified (3 files):**
- `src/pages/OrderConfirmation.tsx` — full rewrite
- `src/pages/Checkout.tsx` — one-line URL change
- `src/App.tsx` — remove `/orders` route + `Orders` import

**Deleted (1 file):**
- `src/pages/Orders.tsx`

---

## Task 1: All four file operations

**Files:**
- Modify: `src/pages/OrderConfirmation.tsx` (full rewrite)
- Modify: `src/pages/Checkout.tsx` (single line change)
- Modify: `src/App.tsx` (remove route + import)
- Delete: `src/pages/Orders.tsx`

All four operations in one dispatch — they're closely related and all needed for the build to stay green.

- [ ] **Step 1: Replace `src/pages/OrderConfirmation.tsx` entirely**

```tsx
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { useFxRate } from "@/hooks/useFxRate";
import { useSKUStocks } from "@/hooks/useSKUStocks";
import { ShippingEstimate } from "@/components/ShippingEstimate";
import { formatCheckoutPrice } from "@/utils/formatCheckoutPrice";
import { EU_COUNTRY_LABELS, type EuCountryCode, getVatRate } from "@/utils/vat";

const TAX_RATE = 0.15;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-6 py-3 border-b border-border last:border-0">
      <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-32 shrink-0">
        {label}
      </span>
      <span className="flex-1 text-body text-text">{value}</span>
    </div>
  );
}

function TotalsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-body">
      <span className="text-text-muted">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPlaced = searchParams.get('placed') === '1';

  const { data: order, isLoading, error } = useOrder(orderId!);
  const { mdlPerEur } = useFxRate();

  // Collect SKU ids for live shipping estimate (sub-project D pattern)
  const orderSkuIds: string[] = [];
  if (order?.items) {
    for (const item of order.items) {
      if (item.sku_id) orderSkuIds.push(item.sku_id);
      const snapshotItems = item.snapshot?.items;
      if (Array.isArray(snapshotItems)) {
        for (const sub of snapshotItems) {
          if (sub?.sku_id) orderSkuIds.push(sub.sku_id);
        }
      }
    }
  }
  const { data: orderStocks = [] } = useSKUStocks(orderSkuIds);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 w-full">
          <div className="space-y-4">
            <div className="h-8 w-1/2 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
            <div className="h-4 w-1/3 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
            <div className="h-32 w-full bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm mt-12" />
            <div className="h-24 w-full bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-4">
              Comanda nu a fost găsită
            </h1>
            <Button variant="ghost" onClick={() => navigate('/shop')}>
              Înapoi la Magazin
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const country = order.shipping_address?.country || 'MD';
  const vatBani = order.total_bani - order.subtotal_bani - order.shipping_bani;
  const taxIncluded = country === 'MD'
    ? Math.round(order.total_bani * (TAX_RATE / (1 + TAX_RATE)))
    : 0;

  const orderShortId = order.id.slice(0, 8).toUpperCase();
  const orderDate = formatDate(order.created_at);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Seo
        title={`Comanda #${orderShortId} | modestshop`}
        description={`Detaliile comenzii #${orderShortId}`}
        image=""
        url=""
        type="website"
      />
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12">
          {/* Headline — celebration mode vs detail mode */}
          {isPlaced ? (
            <div className="text-center max-w-2xl mx-auto pt-8 mb-12">
              <div className="inline-flex items-center justify-center h-12 w-12 mb-6">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
              <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-2">
                Comanda a fost plasată
              </h1>
              <p className="text-caption text-text-muted">
                #{orderShortId} · {orderDate}
              </p>
              <p className="text-body text-text-muted mt-6 max-w-md mx-auto">
                Te vom contacta pe WhatsApp pentru confirmare și plată.
              </p>
            </div>
          ) : (
            <div className="mb-12">
              <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-2">
                Comanda
              </p>
              <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">
                #{orderShortId}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <p className="text-caption text-text-muted">
                  Plasată pe {orderDate}
                </p>
                <Badge variant="outline">{order.status}</Badge>
              </div>
            </div>
          )}

          {/* Produse comandate */}
          <section className="mb-16">
            <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
              Produse comandate
            </p>
            <div className="space-y-0">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-4 border-b border-border last:border-0"
                >
                  {item.snapshot?.image_url && (
                    <img
                      src={item.snapshot.image_url}
                      alt={item.snapshot?.product_name || ''}
                      className="w-12 h-12 object-cover rounded-sm bg-surface-2 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-text-strong truncate">
                      {item.snapshot?.product_name || item.snapshot?.config?.name || 'Produs'}
                    </p>
                    {item.snapshot?.brand && (
                      <p className="text-caption text-text-muted truncate">
                        {item.snapshot.brand}
                      </p>
                    )}
                    {item.snapshot?.size_label ? (
                      <p className="text-caption text-text-muted">
                        {item.snapshot.size_label} · {item.quantity}
                      </p>
                    ) : item.snapshot?.config ? (
                      <p className="text-caption text-text-muted">
                        {item.snapshot.config.total_slots}×{item.snapshot.config.volume_ml}ml · {item.quantity}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-body text-text-strong shrink-0">
                    {formatCheckoutPrice(item.line_total_bani)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-4 mt-4 space-y-2">
              <TotalsRow
                label="Subtotal"
                value={formatCheckoutPrice(order.subtotal_bani)}
              />
              <TotalsRow
                label="Transport"
                value={formatCheckoutPrice(order.shipping_bani)}
              />
              {country !== 'MD' && vatBani > 0 && (
                <TotalsRow
                  label={`TVA ${EU_COUNTRY_LABELS[country as EuCountryCode] ?? ''} (${Math.round((getVatRate(country) ?? 0) * 100)}%)`}
                  value={formatCheckoutPrice(vatBani)}
                />
              )}
              <ShippingEstimate stocks={orderStocks} />
            </div>

            {/* Total */}
            <div className="border-t border-border mt-4 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-body text-text-strong font-medium">Total</span>
                <div className="text-right">
                  <p className="text-h2 md:text-h2-md font-normal text-text-strong">
                    {formatCheckoutPrice(order.total_bani)}
                  </p>
                  <p className="text-caption text-text-muted">
                    MDL{country !== 'MD' && (
                      <> · ≈ €{(order.total_bani / 100 / mdlPerEur).toFixed(2)}</>
                    )}
                  </p>
                </div>
              </div>
              {country === 'MD' && taxIncluded > 0 && (
                <p className="text-caption text-text-muted text-right mt-1">
                  Inclusiv {formatCheckoutPrice(taxIncluded)} din taxe
                </p>
              )}
            </div>
          </section>

          {/* Detalii contact */}
          <section className="mb-16">
            <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
              Detalii contact
            </p>
            <div className="space-y-0">
              <Row label="Email" value={order.customer_email || '—'} />
              <Row label="Telefon" value={order.customer_phone || '—'} />
            </div>
          </section>

          {/* Adresă de livrare */}
          {order.shipping_address && (
            <section className="mb-16">
              <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
                Adresă de livrare
              </p>
              <div className="space-y-1">
                <p className="text-body text-text-strong">{order.customer_name}</p>
                <p className="text-body text-text-muted">{order.shipping_address.address}</p>
                <p className="text-body text-text-muted">
                  {order.shipping_address.city}{order.shipping_address.postalCode ? `, ${order.shipping_address.postalCode}` : ''}
                </p>
                <p className="text-body text-text-muted">{order.shipping_address.country}</p>
              </div>
            </section>
          )}

          {/* Action button */}
          <div className="flex justify-center mt-12">
            <Button variant="ghost" onClick={() => navigate('/shop')}>
              Continuă cumpărăturile
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
```

Notes for the engineer:
- The previous `Card`-based layout, `Package`/`Mail`/`Phone` icons next to section headings, and the green-500 CheckCircle are all gone.
- The `text-success` color comes from the Phase 1 token; verified to exist (`hsl(var(--success))` = sage green).
- VAT computation: `vatBani = total_bani - subtotal_bani - shipping_bani`. If non-MD and `vatBani > 0`, render the row. This derives VAT from the persisted order amounts since sub-project B+C decided not to store VAT separately.
- `taxIncluded` for MD: same formula as Checkout (`total_bani * (TAX_RATE / (1 + TAX_RATE))`).

- [ ] **Step 2: Update `src/pages/Checkout.tsx` — one-line URL change**

Find this block (around line 117 of the post-Phase-2 Checkout.tsx — the `onSuccess` callback inside `createOrder({ ..., onSuccess: (order) => { ... } })`):

```tsx
        onSuccess: (order) => {
          clearCart();
          toast({ title: 'Comanda a fost plasată cu succes' });
          navigate(`/orders/${order.id}`);
        },
```

Replace with:

```tsx
        onSuccess: (order) => {
          clearCart();
          toast({ title: 'Comanda a fost plasată cu succes' });
          navigate(`/orders/${order.id}?placed=1`);
        },
```

The single change: append `?placed=1` to the navigate URL. The OrderConfirmation page (Step 1) detects this param and renders celebration mode.

- [ ] **Step 3: Update `src/App.tsx` — remove the `/orders` route + import**

Read `src/App.tsx`. Find the import line for `Orders`:

```tsx
import Orders from "./pages/Orders";
```

Remove it.

Find the route line:

```tsx
<Route path="/orders" element={<Orders />} />
```

Remove it.

The route `<Route path="/orders/:orderId" element={<OrderConfirmation />} />` stays.

- [ ] **Step 4: Delete `src/pages/Orders.tsx`**

```bash
rm /Users/bigjeery/Documents/wrk/fragrance-shop-main/src/pages/Orders.tsx
```

- [ ] **Step 5: Verify build**

Run: `npm run build` from `/Users/bigjeery/Documents/wrk/fragrance-shop-main`
Expected: success.

If `tsc` complains:
- "Can't find module Orders" → confirm App.tsx import was removed
- Any lingering reference to `/orders` (the list path) in nav components — flag and remove
- "EU_COUNTRY_LABELS not found" → check `src/utils/vat.ts` (should exist post-B+C)
- "useFxRate not found" → check `src/hooks/useFxRate.ts` (should exist post-B+C)

- [ ] **Step 6: Save point**

All 4 file operations applied. The customer-facing order list is gone; the detail page handles both confirmation and detail modes.

---

## Task 2: Final build verify

**Files:** none modified.

- [ ] **Step 1: Run final build**

Run: `npm run build`
Expected: success.

- [ ] **Step 2: User runs manual QA**

The user runs manual QA themselves. The agentic plan does not include QA steps per the user's preference. Suggested QA spots:
- `/orders/<id>?placed=1` → celebration mode renders with `text-success` checkmark + "Comanda a fost plasată" + WhatsApp follow-up text
- `/orders/<id>` (no param) → detail mode with eyebrow + status pill, no celebration
- `/orders` (the deleted list) → renders the NotFound page (acceptable; the route is gone)
- Navigating to `/orders/INVALID` → "Comanda nu a fost găsită" centered with "Înapoi la Magazin" button
- Place an order in Checkout → redirects to `/orders/<id>?placed=1` and shows celebration

---

## Self-review notes (plan author)

- **Spec coverage:**
  - Decision 1 (cut /orders list) → Step 3 + Step 4
  - Decision 2 (`?placed=1` toggle) → Step 1 (mode rendering) + Step 2 (Checkout URL change)
  - Decision 3 (preserve B+C/D logic) → Step 1's totals block + ShippingEstimate
  - Decision 4 (flat eyebrow sections, no Card chrome) → Step 1's section markup
  - Decision 5 (`text-success` token instead of green-500) → Step 1's CheckCircle2
- **Placeholders:** None. Every step has full code or exact commands.
- **Type/name consistency:** `OrderConfirmation`, `Row`, `TotalsRow`, `formatDate` — used verbatim within the file. No cross-file type concerns since this plan touches mostly one component plus surgical 1-line changes.
- **No QA task** per user preference. Task 2 is build verify only.
