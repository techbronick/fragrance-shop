# Redesign Phase 3 — Order pages

**Date:** 2026-04-28
**Project:** Apple-caliber redesign of modestshop.md
**Phase:** 3 — second sub-project: **Order pages**
**Status:** spec — awaiting review

## Single jobs

- **`/orders/:orderId` (confirmation mode, `?placed=1`):** confirm the order placed and tell the customer what happens next.
- **`/orders/:orderId` (detail mode):** show the customer the facts of an order they're checking on.

## Phase context

Phase 2 + Phase 3 Discovery shipped earlier. This is the second Phase 3 sub-project. The visual cleanup is straightforward — apply Phase 2 patterns (eyebrow headings, no Card chrome, disciplined hierarchy). The only non-trivial decision is the dual-purpose mode handled via `?placed=1`.

## Decisions captured

| # | Decision | Rationale |
|---|---|---|
| 1 | Cut `/orders` history list (Q1 C) | Off-site WhatsApp/Telegram support model: the chat IS the order history. The customer-facing self-service list is decorative |
| 2 | Single page for `/orders/:orderId` with `?placed=1` toggling celebration vs detail mode (Q1 C revisited) | One component, two states. Cleaner than two routes |
| 3 | Preserve all B+C / D logic (VAT row, EUR estimate, "Inclusiv din taxe", ShippingEstimate) | Already shipped; not redesigning the math |
| 4 | Replace Card-wrapped sections with flat eyebrow-headed sections | Phase 2 pattern; reduces chrome |
| 5 | Replace `text-green-500` `CheckCircle2` with `--success` token (sage) — Phase 1 color rule | Consistent with the design system |

## Non-goals

- No DB schema changes
- No new copy beyond the celebration headline
- No payment integration changes (off-site model preserved)
- No customer registration / login (out of scope; informs Q1 decision)
- No order tracking integrations (carrier APIs etc.) — out of scope
- No reorder feature
- No order comparison

## Architecture

### File map

**Modified (3 files):**
- `src/pages/OrderConfirmation.tsx` — restructured to apply Phase 2 patterns + handle `?placed=1` mode. ~200 lines target (down from ~190).
- `src/pages/Checkout.tsx` — one-line change: navigate to `/orders/${order.id}?placed=1` instead of `/orders/${order.id}` after order creation success.
- `src/App.tsx` — remove the `<Route path="/orders" element={<Orders />} />` line and the `Orders` import.

**Deleted (1 file):**
- `src/pages/Orders.tsx` — the order-history list. Cut entirely per Q1 C.

**Reused (no changes):**
- `useOrder(orderId)` hook (existing)
- `useOrders(userId)` hook stays — still used by the admin panel
- `useSKUStocks` hook (sub-project D)
- `<ShippingEstimate>` (sub-project D)
- VAT utils (sub-project B+C)
- `formatCheckoutPrice` util
- Phase 1 primitives (Button, Badge)

## OrderConfirmation page

Two modes determined by URL search param `?placed=1`.

### Confirmation mode (`?placed=1`)

```tsx
<div className="text-center max-w-2xl mx-auto pt-8 mb-12">
  <div className="inline-flex items-center justify-center h-12 w-12 mb-6">
    <CheckCircle2 className="h-12 w-12 text-success" />
  </div>
  <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-2">
    Comanda a fost plasată
  </h1>
  <p className="text-caption text-text-muted">
    #{order.id.slice(0, 8).toUpperCase()} · {formatDate(order.created_at)}
  </p>
  <p className="text-body text-text-muted mt-6 max-w-md mx-auto">
    Te vom contacta pe WhatsApp pentru confirmare și plată.
  </p>
</div>
```

Visual: centered, generous space, single icon, restrained celebration. The icon uses `text-success` (the sage token from Phase 1). No green-500. No "Comandă Confirmată!" exclamation; just the factual past-tense statement.

### Detail mode (no `?placed=1`)

```tsx
<div className="mb-12">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-2">
    Comanda
  </p>
  <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">
    #{order.id.slice(0, 8).toUpperCase()}
  </h1>
  <div className="flex items-center gap-3 mt-2">
    <p className="text-caption text-text-muted">
      Plasată pe {formatDate(order.created_at)}
    </p>
    <Badge variant="outline">{order.status}</Badge>
  </div>
</div>
```

Left-aligned, no celebration chrome, status as a Phase 1 outline `<Badge>`.

### Body sections (both modes share)

#### Produse comandate

```tsx
<section className="mb-16">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
    Produse comandate
  </p>
  <div className="space-y-0">
    {order.items.map((item) => (
      <div key={item.id} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
        {item.snapshot?.image_url && (
          <img
            src={item.snapshot.image_url}
            alt={item.snapshot.product_name || ''}
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
          {item.snapshot?.size_label && (
            <p className="text-caption text-text-muted">
              {item.snapshot.size_label} · {item.quantity}
            </p>
          )}
          {item.snapshot?.config && !item.snapshot?.size_label && (
            <p className="text-caption text-text-muted">
              {item.snapshot.config.total_slots}×{item.snapshot.config.volume_ml}ml · {item.quantity}
            </p>
          )}
        </div>
        <p className="text-body text-text-strong shrink-0">
          {formatCheckoutPrice(item.line_total_bani)}
        </p>
      </div>
    ))}
  </div>

  {/* Totals block */}
  <div className="border-t border-border pt-4 mt-4 space-y-2">
    <Row label="Subtotal" value={formatCheckoutPrice(order.subtotal_bani)} />
    <Row label="Transport" value={formatCheckoutPrice(order.shipping_bani)} />
    {/* VAT row preserved from B+C if non-MD; the order does not store country in a
        separate field — derive from shipping_address.country */}
    {country !== 'MD' && (
      <Row
        label={`TVA ${EU_COUNTRY_LABELS[country as EuCountryCode] ?? ''} (${Math.round((getVatRate(country) ?? 0) * 100)}%)`}
        value={formatCheckoutPrice(order.total_bani - order.subtotal_bani - order.shipping_bani)}
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
```

VAT and EUR estimate logic preserved verbatim from the existing Phase 2 Checkout's OrderSummary. The country is read from `order.shipping_address.country`. The `taxIncluded` for MD is computed locally: `Math.round(order.total_bani * (TAX_RATE / (1 + TAX_RATE)))` with `TAX_RATE = 0.15`.

#### Detalii contact

```tsx
<section className="mb-16">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
    Detalii contact
  </p>
  <div className="space-y-0">
    <Row label="Email" value={order.customer_email || '—'} variant="row" />
    <Row label="Telefon" value={order.customer_phone || '—'} variant="row" />
  </div>
</section>
```

Same `Row` helper as PDP DetailsSection — caption-eyebrow on left, body value on right, 1px border between rows.

#### Adresă de livrare

```tsx
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
```

Stacked plain text, no Card wrap.

### Action buttons (bottom of page)

```tsx
<div className="flex justify-center mt-12">
  <Button variant="ghost" onClick={() => navigate('/shop')}>
    Continuă cumpărăturile
  </Button>
</div>
```

Single ghost button. No "Vezi toate comenzile" — the route is gone.

### `<Row>` helper

Same shape as PDP DetailsSection's Row:

```tsx
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
```

For the totals block, a different inline pattern is used (the existing `flex justify-between` row).

### Date formatting

```ts
new Date(order.created_at).toLocaleDateString('ro-RO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
// → "28 aprilie 2026"
```

Reused from existing `OrderConfirmation.tsx`'s date logic.

## Edge cases

| Case | Behavior |
|---|---|
| Loading | Skeleton: centered headline placeholder + 3 section placeholders mirroring final layout (animate-shimmer) |
| Order not found (`!order`) | Centered: `text-h1 "Comanda nu a fost găsită"` + ghost button `Înapoi la Magazin` → `/shop`. The `?placed=1` query param is ignored — don't show celebration for a non-existent order. |
| Order has no items | Items section omitted (or shows `Niciun produs.` — preserve existing behavior) |
| `shipping_address` is null | Address section omitted entirely |
| Country = MD | VAT row hidden; EUR estimate hidden; "Inclusiv din taxe" footnote shown |
| Country = EU-27 | VAT row visible; EUR estimate visible; footnote hidden |
| `?placed=1` on a returning visit | Celebration mode renders. Customer probably navigated from another tab; harmless. |
| Reduced motion | No animations to disable on this page (it's static) |

## Functionality preservation

Audit items 41–45 (Checkout & orders, post-purchase):

| # | Feature | Preserved? |
|---|---|---|
| 41 | Order summary at checkout | ✅ (Phase 2 OrderSummary) |
| 42 | VAT calculation | ✅ (B+C) |
| 43 | Place order | ✅ (Phase 2 Checkout) |
| 44 | View order history | ❌ — cut per Q1 C decision |
| 45 | View order detail (post-purchase OR returning) | ✅ (`/orders/:orderId` with both modes) |

Item 44 is the intentional regression. Order detail is reachable via the URL the customer was sent post-purchase (now with `?placed=1`).

## Forward compatibility

- **Customer accounts (future):** if registration ever lands, the `/orders` list can be reintroduced as `Orders.tsx` filtering by `user_id`. The detail page stays unchanged.
- **i18n (sub-project A):** all Romanian strings inline (`Comanda a fost plasată`, `Te vom contacta pe WhatsApp pentru confirmare și plată.`, `Comanda`, `Plasată pe`, `Produse comandate`, `Detalii contact`, `Adresă de livrare`, `Email`, `Telefon`, `Subtotal`, `Transport`, `Total`, `Inclusiv ... din taxe`, `Continuă cumpărăturile`, `Comanda nu a fost găsită`, `Înapoi la Magazin`) — swap points for sub-project A.
- **Email receipt (future):** if an actual confirmation email is added later, the URL pattern is already permanent and can be linked from the email body.

## Out of scope / deferred

- Customer registration / login
- Email receipt / order-confirmation email send
- Order tracking integrations (carrier APIs)
- Order cancellation UI for customers
- Reorder feature
- Order comparison
- Real-time order status updates
