# Redesign Phase 2 — Checkout

**Date:** 2026-04-27
**Project:** Apple-caliber redesign of modestshop.md
**Phase:** 2 (page-level redesigns) — fourth and final sub-page: **Checkout (`/checkout`)**
**Status:** spec — awaiting review

## Single job

> Convert a cart into a placed order with minimal friction.

The form is the page. Order summary always visible. Validation inline per field. Submit reachable without scroll on mobile.

## Phase context

PDP, Home, and Shop redesigns shipped earlier today. This is the last Phase 2 sub-project. After Checkout, Phase 2 closes.

The page already inherited Phase 1 design tokens via the global cleanup pass. Sub-projects D (shipping estimate) and B+C (Europe VAT, country expansion, EUR estimate) added significant logic. This redesign restructures the file, applies disciplined form layout, and adopts the consistent Phase 2 patterns (eyebrows, sectioned content, mobile sticky CTA).

## Decisions captured

| # | Decision | Rationale |
|---|---|---|
| 1 | Single job: minimal-friction order placement | Justifies cuts to checkboxes that don't earn their place |
| 2 | Cut newsletter opt-in checkbox | Conversion-killing friction; can move to order-confirmation page later |
| 3 | Cut save-address checkbox; auto-save silently | Customer wants this by default; the checkbox was permission-asking decoration |
| 4 | Cut shipping-method select (only one option exists) | Decision noise; show as static line in summary; reappear if more options exist |
| 5 | Single-block form with row groupings (Q2 A) | 8 fields is small enough; sectioning adds noise |
| 6 | Right sticky sidebar summary on desktop, top card on mobile (Q3 A) | Customer always sees what they're paying; matches industry-best pattern |
| 7 | Submit button: bottom of form on desktop, sticky bottom bar on mobile (Q4 A) | High-conversion mobile pattern; matches Phase 2 PDP precedent |

## Non-goals

- No DB schema changes
- No payment integration (off-site WhatsApp/Telegram model preserved per memory)
- No new form fields beyond the existing 8
- No multi-language support (parked behind redesign)
- No multiple shipping methods (flat 50 Lei stays per B+C decisions)
- No saved-address account feature beyond localStorage rehydration
- No analytics events / conversion tracking
- No A/B testing infrastructure
- No order-confirmation page changes (out of scope; covered by sub-project D + post-redesign acceptance)

## Architecture

### File map

**Modified:**
- `src/pages/Checkout.tsx` — restructured. Owns form state, address localStorage rehydration, submit handler. Targets ~200 lines (down from ~600+).

**Created:**
- `src/components/checkout/CheckoutForm.tsx` — the address form (8 fields, row layouts, inline validation). Internal `<Field>` helper for label + error pattern.
- `src/components/checkout/OrderSummary.tsx` — summary card with line items, totals, VAT row (non-MD), EUR estimate (non-MD), `Inclusiv din taxe` footnote (MD only)
- `src/components/checkout/MobileSubmitBar.tsx` — fixed-bottom bar shown only on `< lg`, hidden on empty cart, hidden on desktop

**Reused (no changes):**
- `<Button>`, `<Input>`, `<Select>` (Phase 1 primitives)
- `<ShippingEstimateForCart>` (sub-project D)
- `useFxRate` hook (sub-project B+C)
- `useCreateOrder` hook (existing)
- VAT utils — `EU_COUNTRY_LABELS`, `getVatRate`, `calculateVatBani` (sub-project B+C)
- `formatPrice`, `formatCheckoutPrice` utils

### State management

State stays in `Checkout.tsx`:

```ts
const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(loadFromLocalStorage);
const [touched, setTouched] = useState<Record<string, boolean>>({});
const [submitted, setSubmitted] = useState(false);

// Auto-save on every change
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shippingAddress));
}, [shippingAddress]);
```

Form auto-saves silently — no checkbox required (per Q1).

`useFxRate` and `useCreateOrder` are called once at the top of `Checkout.tsx`, results passed down as props.

## Page layout

### Desktop (`lg+`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Checkout                                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │  CONTACT (eyebrow)                    │ │  ÎN COȘ (eyebrow)              │ │
│ │  [email]                  [phone]     │ │  [item][item][item]            │ │
│ │                                       │ │  ─────────────                 │ │
│ │  ADRESĂ DE LIVRARE                    │ │  Subtotal     1 000 Lei        │ │
│ │  [prenume]                [nume]      │ │  Transport       50 Lei        │ │
│ │  [adresă]                             │ │  TVA Germania (19%)  190 Lei   │ │
│ │  [oraș]                   [cod poș.]  │ │  ─────────────                 │ │
│ │  [țară ▾]                             │ │  Total        1 240 Lei        │ │
│ │                                       │ │              MDL · ≈ €63.59    │ │
│ │  [ Plasează comanda                ]  │ │                                │ │
│ └──────────────────────────────────────┘ └────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

- 12-col grid: form cols 1–7, summary cols 8–12
- Summary sticky `lg:sticky lg:top-24 lg:self-start`
- Form column has `space-y-8` between Contact / Adresă / Submit blocks
- Submit button at the end of the form column (visible because summary is sticky alongside)

### Mobile (`< lg`)

- Single column
- Summary card on top (markup order trick: `order-first lg:order-none`)
- Form below
- Sticky submit bar at viewport bottom
- Page bottom-padding ~80px to clear the sticky bar

```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
  <div className="lg:col-span-7">
    <CheckoutForm ... />
  </div>
  <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start order-first lg:order-none">
    <OrderSummary ... />
  </div>
</div>
<MobileSubmitBar ... />
```

## CheckoutForm

### Section pattern

Each section is a flat block (no card wrapper) with a caption-eyebrow heading and stacked fields.

### Contact section

```tsx
<section className="space-y-4">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted">
    Contact
  </p>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Field label="Email" error={errorFor('email')}>
      <Input
        type="email"
        value={shippingAddress.email}
        onChange={(e) => updateField('email', e.target.value)}
        onBlur={() => markTouched('email')}
      />
    </Field>
    <Field label="Telefon" error={errorFor('phone')}>
      <Input
        type="tel"
        value={shippingAddress.phone}
        onChange={(e) => updateField('phone', e.target.value)}
        onBlur={() => markTouched('phone')}
      />
    </Field>
  </div>
</section>
```

### Adresă de livrare section

```tsx
<section className="space-y-4">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted">
    Adresă de livrare
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Field label="Prenume" error={errorFor('firstName')}>
      <Input value={shippingAddress.firstName} ... />
    </Field>
    <Field label="Nume" error={errorFor('lastName')}>
      <Input value={shippingAddress.lastName} ... />
    </Field>
  </div>

  <Field label="Adresă" error={errorFor('address')}>
    <Input value={shippingAddress.address} ... />
  </Field>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Field label="Oraș" error={errorFor('city')}>
      <Input value={shippingAddress.city} ... />
    </Field>
    <Field label="Cod poștal" error={errorFor('postalCode')}>
      <Input value={shippingAddress.postalCode} ... />
    </Field>
  </div>

  <Field label="Țară">
    <Select
      value={shippingAddress.country}
      onValueChange={(v) => updateField('country', v)}
    >
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="MD">Republica Moldova</SelectItem>
        {(Object.entries(EU_COUNTRY_LABELS) as [EuCountryCode, string][])
          .sort((a, b) => a[1].localeCompare(b[1], 'ro'))
          .map(([code, label]) => (
            <SelectItem key={code} value={code}>{label}</SelectItem>
          ))}
      </SelectContent>
    </Select>
  </Field>
</section>
```

### `<Field>` helper

Private to `CheckoutForm.tsx`. Same shape across all fields. Accepts a `name` prop used for the scroll-target `id` attribute:

```tsx
function Field({
  name,
  label,
  error,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={`field-${name}`} className="space-y-1.5">
      <label className="text-caption text-text-muted">{label}</label>
      {children}
      {error && (
        <p className="text-caption text-error">{error}</p>
      )}
    </div>
  );
}
```

All `<Field>` call sites pass `name="email"`, `name="phone"`, etc., so the scroll-to-first-error logic can target `#field-<name>`.

### Validation rules

| Field | Rule |
|---|---|
| Email | required + email regex |
| Telefon | required + 7+ digits (after stripping non-digits) |
| Prenume / Nume / Adresă / Oraș | required (non-empty trim) |
| Cod poștal | required if `country !== 'MD'`; 3+ chars |
| Țară | always set; no error possible |

```ts
function validate(addr: ShippingAddress): Record<string, string | null> {
  const errors: Record<string, string | null> = {};
  errors.email = !addr.email
    ? 'E-mail este obligatoriu'
    : !/^\S+@\S+\.\S+$/.test(addr.email)
      ? 'E-mail invalid'
      : null;
  errors.phone = !addr.phone
    ? 'Telefon este obligatoriu'
    : addr.phone.replace(/\D/g, '').length < 7
      ? 'Telefon invalid'
      : null;
  errors.firstName = !addr.firstName.trim() ? 'Prenume este obligatoriu' : null;
  errors.lastName = !addr.lastName.trim() ? 'Nume este obligatoriu' : null;
  errors.address = !addr.address.trim() ? 'Adresă este obligatorie' : null;
  errors.city = !addr.city.trim() ? 'Oraș este obligatoriu' : null;
  errors.postalCode = (addr.country !== 'MD' && (addr.postalCode || '').trim().length < 3)
    ? 'Cod poștal este obligatoriu'
    : null;
  return errors;
}

function errorFor(field: string): string | undefined {
  const err = errors[field];
  if (!err) return undefined;
  if (touched[field] || submitted) return err;
  return undefined;
}
```

Submit triggers `setSubmitted(true)` so all errors reveal at once. Scroll-to-first-error happens via:

```ts
const firstErroredField = Object.keys(errors).find(k => errors[k]);
if (firstErroredField) {
  document.getElementById(`field-${firstErroredField}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  document.querySelector<HTMLInputElement>(`#field-${firstErroredField} input`)?.focus();
}
```

(Each `<Field>` wrapping div gets `id={`field-${name}`}` so the scroll target works.)

### Submit button (desktop only)

```tsx
<Button
  variant="primary"
  size="lg"
  className="hidden lg:flex w-full mt-4"
  onClick={handleSubmit}
  disabled={isCreatingOrder || items.length === 0}
>
  {isCreatingOrder ? "Se procesează..." : "Plasează comanda"}
</Button>
```

Hidden on mobile because the sticky bottom bar carries the submit there.

## OrderSummary

```tsx
<aside className="bg-surface border border-border rounded-md p-6 md:p-8">
  <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-4">
    În coș
  </p>

  {items.length === 0 ? (
    <div className="text-center">
      <p className="text-body text-text-muted">Coșul este gol.</p>
      <Button variant="ghost" className="mt-4" onClick={() => navigate('/shop')}>
        Înapoi la Magazin
      </Button>
    </div>
  ) : (
    <>
      {/* Line items */}
      <div className="space-y-3 mb-6">
        {items.map(item => (
          <div key={item.id + (item.skuId ?? '')} className="flex gap-3">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-sm bg-surface-2 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-body text-text-strong truncate">{item.name}</p>
              {item.sizeLabel && (
                <p className="text-caption text-text-muted">
                  {item.sizeLabel} × {item.quantity}
                </p>
              )}
            </div>
            <p className="text-body text-text-strong shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-border pt-4 space-y-2">
        <Row label="Subtotal" value={formatCheckoutPrice(totals.subtotal)} />
        <Row label="Transport" value={formatCheckoutPrice(totals.shipping)} />
        {country !== 'MD' && (
          <Row
            label={`TVA ${EU_COUNTRY_LABELS[country as EuCountryCode] ?? ''} (${Math.round((getVatRate(country) ?? 0) * 100)}%)`}
            value={formatCheckoutPrice(totals.vat)}
          />
        )}
        <ShippingEstimateForCart />
      </div>

      {/* Total */}
      <div className="border-t border-border mt-4 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-body text-text-strong font-medium">Total</span>
          <div className="text-right">
            <p className="text-h2 md:text-h2-md font-normal text-text-strong">
              {formatCheckoutPrice(totals.total)}
            </p>
            <p className="text-caption text-text-muted">
              MDL{country !== 'MD' && (
                <> · ≈ €{(totals.total / 100 / mdlPerEur).toFixed(2)}</>
              )}
            </p>
          </div>
        </div>
        {totals.taxIncluded > 0 && (
          <p className="text-caption text-text-muted text-right mt-1">
            Inclusiv {formatCheckoutPrice(totals.taxIncluded)} din taxe
          </p>
        )}
      </div>
    </>
  )}
</aside>
```

The internal `Row` helper:

```tsx
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-body">
      <span className="text-text-muted">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}
```

## MobileSubmitBar

```tsx
type Props = {
  total: number;
  country: string;
  mdlPerEur: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  itemCount: number;
};

export function MobileSubmitBar({ total, country, mdlPerEur, onSubmit, isSubmitting, itemCount }: Props) {
  if (itemCount === 0) return null;

  return (
    <div
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-caption text-text-muted">Total</p>
          <p className="text-body text-text-strong">
            {formatCheckoutPrice(total)}
            {country !== 'MD' && (
              <span className="text-caption text-text-muted ml-2">
                ≈ €{(total / 100 / mdlPerEur).toFixed(2)}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '...' : 'Plasează comanda'}
        </Button>
      </div>
    </div>
  );
}
```

## Edge cases & states

| Case | Behavior |
|---|---|
| Empty cart | Summary shows empty-state with `Înapoi la Magazin` ghost button; form hidden; mobile bar hidden |
| Submit with validation errors | All `submitted` flags set; first errored field scrolled to + focused; submit early-returns |
| `useCreateOrder` network error | Existing toast pattern; form state preserved; user retries |
| Order created successfully | Existing pattern: `clearCart()` + redirect to `/orders/<orderId>` |
| `useFxRate` loading | EUR estimate shows fallback (`19.5`) — same as B+C edge case behavior |
| Country = MD | VAT row hidden; EUR estimate hidden; `Inclusiv din taxe` footnote shown |
| Country = EU-27 | VAT row visible; EUR estimate visible; footnote hidden |
| Live country change (mid-form) | Totals recompute on every render |
| localStorage corrupt | Falls back to `DEFAULT_SHIPPING_ADDRESS` (existing behavior preserved) |
| Reduced motion | Form transitions are micro-state shifts only — no special handling needed |

## Functionality preservation

Audit items 35–43 (Checkout & orders). All preserved except:

| # | Feature | Preserved? |
|---|---|---|
| 35 | Address fields (8) | ✅ |
| 36 | Country select (28 options after B+C) | ✅ |
| 37 | Shipping method select | ❌ — cut per Q1 (single option, decision noise; reappears when more methods exist) |
| 38 | Newsletter opt-in | ❌ — cut per Q1 |
| 39 | Save address (localStorage) | ✅ — auto-save, no checkbox |
| 40 | Inline validation | ✅ |
| 41 | Order summary | ✅ |
| 42 | VAT calculation by country | ✅ (B+C preserved) |
| 43 | Place order | ✅ |

Three intentional regressions, all documented in Q1 decisions.

## Forward compatibility

- **Multiple shipping methods (future):** When more than one method exists, the cut select returns as a section between Adresă and the submit button. The mobile submit bar stays unchanged.
- **Newsletter consent (future):** If the operator wants explicit consent, it's added to the order-confirmation page after success ("Vrei să primești noutăți?"), not on the checkout form.
- **Online payment (future):** Adding payment fields would require a fourth section in the form (`Plată`) and possibly a wizard. The current single-block structure absorbs one more section without architectural changes.
- **i18n (sub-project A):** all Romanian strings (`Checkout`, `Contact`, `Adresă de livrare`, `Țară`, `Email`, `Telefon`, `Prenume`, `Nume`, `Adresă`, `Oraș`, `Cod poștal`, `Plasează comanda`, `Se procesează...`, `În coș`, `Subtotal`, `Transport`, `Total`, `MDL`, `Coșul este gol`, `Înapoi la Magazin`, all error messages) live as inline JSX strings — they become the swap points when sub-project A resumes.

## Out of scope / deferred

- Payment integration
- Account creation during checkout
- Guest vs returning-customer flows
- Address autocomplete (Google Places, etc.)
- Multi-currency display beyond MDL + EUR estimate
- Order notes / gift-wrapping options
- Coupon / discount code field
- Tax-exempt B2B flows
