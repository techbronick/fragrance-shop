# Redesign Phase 2 — Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Checkout page into a focused two-column desktop / stacked mobile form with sticky order summary, eyebrow-sectioned form fields, inline validation, and a sticky mobile submit bar. Cut three pieces of friction (newsletter checkbox, save-address checkbox, single-option shipping-method select).

**Architecture:** Three new components in `src/components/checkout/` (CheckoutForm, OrderSummary, MobileSubmitBar). `Checkout.tsx` becomes pure orchestration owning form state, validation, address localStorage rehydration, and the submit handler.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, shadcn/Radix, `@tanstack/react-query`, Supabase JS. Phase 1 design tokens + primitives + sub-project D (ShippingEstimate) + sub-project B+C (VAT, EUR estimate, country expansion) all in production.

**Spec:** `docs/superpowers/specs/2026-04-27-redesign-phase-2-checkout-design.md`

**Environment notes:**
- No test runner. Verification = `npm run build`. Manual QA in Task 5.
- ESLint pre-broken — skip `npm run lint`.
- Not a git repo. No commits.
- Path alias `@/*` → `src/*`.
- Romanian diacritics required throughout (`Plasează comanda`, `Adresă`, `Țară`, `Prenume`, `Cod poștal`, `Înapoi la Magazin`, `În coș`, `Coșul este gol`, etc.).

---

## File structure

**Modified (1 file):**
- `src/pages/Checkout.tsx` — restructured; orchestration only

**Created (3 files):**
- `src/components/checkout/CheckoutForm.tsx` — 8-field address form with row groupings, internal `<Field>` helper, inline validation messaging, scroll-to-error
- `src/components/checkout/OrderSummary.tsx` — line items + totals + VAT row + EUR estimate + footnote, with empty-cart state
- `src/components/checkout/MobileSubmitBar.tsx` — sticky bottom bar shown on `< lg` only

**No changes (consumed):**
- `<Button>`, `<Input>`, `<Select>` (Phase 1)
- `<ShippingEstimateForCart>` (sub-project D)
- `useFxRate` (sub-project B+C, in `src/hooks/useFxRate.ts`)
- `useCreateOrder` (in `src/hooks/useOrders.ts`)
- `EU_COUNTRY_LABELS`, `EuCountryCode`, `calculateVatBani`, `getVatRate` (sub-project B+C, in `src/utils/vat.ts`)
- `formatPrice`, `formatCheckoutPrice` (existing utils)

---

## Task 1: Three new components (CheckoutForm + OrderSummary + MobileSubmitBar)

**Files:**
- Create: `src/components/checkout/CheckoutForm.tsx`
- Create: `src/components/checkout/OrderSummary.tsx`
- Create: `src/components/checkout/MobileSubmitBar.tsx`

The directory `src/components/checkout/` doesn't exist yet — create it as part of writing the first file.

The three components are independent of each other. Build them all, then verify with one build.

- [ ] **Step 1: Create `CheckoutForm.tsx`**

```tsx
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ShippingAddress } from "@/types/checkout";
import { EU_COUNTRY_LABELS, type EuCountryCode } from "@/utils/vat";

type Errors = Partial<Record<keyof ShippingAddress, string>>;

type Props = {
  shippingAddress: ShippingAddress;
  onChange: (next: ShippingAddress) => void;
  errors: Errors;
  touched: Partial<Record<keyof ShippingAddress, boolean>>;
  onBlur: (field: keyof ShippingAddress) => void;
  submitted: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  cartIsEmpty: boolean;
};

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

export function CheckoutForm({
  shippingAddress,
  onChange,
  errors,
  touched,
  onBlur,
  submitted,
  onSubmit,
  isSubmitting,
  cartIsEmpty,
}: Props) {
  const errorFor = (field: keyof ShippingAddress): string | undefined => {
    const err = errors[field];
    if (!err) return undefined;
    if (touched[field] || submitted) return err;
    return undefined;
  };

  const updateField = (field: keyof ShippingAddress, value: string) => {
    onChange({ ...shippingAddress, [field]: value });
  };

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {/* Contact */}
      <section className="space-y-4">
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted">
          Contact
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field name="email" label="Email" error={errorFor('email')}>
            <Input
              type="email"
              value={shippingAddress.email}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => onBlur('email')}
              autoComplete="email"
            />
          </Field>
          <Field name="phone" label="Telefon" error={errorFor('phone')}>
            <Input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              onBlur={() => onBlur('phone')}
              autoComplete="tel"
            />
          </Field>
        </div>
      </section>

      {/* Adresă de livrare */}
      <section className="space-y-4">
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted">
          Adresă de livrare
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field name="firstName" label="Prenume" error={errorFor('firstName')}>
            <Input
              value={shippingAddress.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              onBlur={() => onBlur('firstName')}
              autoComplete="given-name"
            />
          </Field>
          <Field name="lastName" label="Nume" error={errorFor('lastName')}>
            <Input
              value={shippingAddress.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              onBlur={() => onBlur('lastName')}
              autoComplete="family-name"
            />
          </Field>
        </div>

        <Field name="address" label="Adresă" error={errorFor('address')}>
          <Input
            value={shippingAddress.address}
            onChange={(e) => updateField('address', e.target.value)}
            onBlur={() => onBlur('address')}
            autoComplete="street-address"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field name="city" label="Oraș" error={errorFor('city')}>
            <Input
              value={shippingAddress.city}
              onChange={(e) => updateField('city', e.target.value)}
              onBlur={() => onBlur('city')}
              autoComplete="address-level2"
            />
          </Field>
          <Field name="postalCode" label="Cod poștal" error={errorFor('postalCode')}>
            <Input
              value={shippingAddress.postalCode ?? ''}
              onChange={(e) => updateField('postalCode', e.target.value)}
              onBlur={() => onBlur('postalCode')}
              autoComplete="postal-code"
            />
          </Field>
        </div>

        <Field name="country" label="Țară">
          <Select
            value={shippingAddress.country}
            onValueChange={(v) => updateField('country', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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
          </Select>
        </Field>
      </section>

      {/* Submit (desktop only) */}
      <Button
        variant="primary"
        size="lg"
        className="hidden lg:flex w-full"
        type="submit"
        disabled={isSubmitting || cartIsEmpty}
      >
        {isSubmitting ? 'Se procesează...' : 'Plasează comanda'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Create `OrderSummary.tsx`**

```tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShippingEstimateForCart } from "@/components/ShippingEstimateForCart";
import { CartItem } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatPrice";
import { formatCheckoutPrice } from "@/utils/formatCheckoutPrice";
import { EU_COUNTRY_LABELS, type EuCountryCode, getVatRate } from "@/utils/vat";

type Totals = {
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
  taxIncluded: number;
};

type Props = {
  items: CartItem[];
  totals: Totals;
  country: string;
  mdlPerEur: number;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-body">
      <span className="text-text-muted">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}

export function OrderSummary({ items, totals, country, mdlPerEur }: Props) {
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <aside className="bg-surface border border-border rounded-md p-6 md:p-8 text-center">
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-4">
          În coș
        </p>
        <p className="text-body text-text-muted">Coșul este gol.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/shop')}>
          Înapoi la Magazin
        </Button>
      </aside>
    );
  }

  return (
    <aside className="bg-surface border border-border rounded-md p-6 md:p-8">
      <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-4">
        În coș
      </p>

      {/* Line items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
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

      {/* Subtotal / Shipping / VAT */}
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
    </aside>
  );
}
```

- [ ] **Step 3: Create `MobileSubmitBar.tsx`**

```tsx
import { Button } from "@/components/ui/button";
import { formatCheckoutPrice } from "@/utils/formatCheckoutPrice";

type Props = {
  total: number;
  country: string;
  mdlPerEur: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  itemCount: number;
};

export function MobileSubmitBar({
  total,
  country,
  mdlPerEur,
  onSubmit,
  isSubmitting,
  itemCount,
}: Props) {
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

- [ ] **Step 4: Verify build**

Run: `npm run build` from `/Users/bigjeery/Documents/wrk/fragrance-shop-main`
Expected: success.

- [ ] **Step 5: Save point**

All three components built. Not yet wired into the page (Task 2 next).

---

## Task 2: Restructure Checkout.tsx

**Files:**
- Modify: `src/pages/Checkout.tsx` (full file replacement)

The current `Checkout.tsx` is ~600+ lines. Replace it entirely with this orchestration shell.

- [ ] **Step 1: Replace `src/pages/Checkout.tsx` entirely**

```tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { useFxRate } from "@/hooks/useFxRate";
import { calculateVatBani } from "@/utils/vat";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { MobileSubmitBar } from "@/components/checkout/MobileSubmitBar";
import {
  ShippingAddress,
  DEFAULT_SHIPPING_ADDRESS,
} from "@/types/checkout";
import { CreateOrderInput } from "@/types/orders";

const STORAGE_KEY = 'checkout_shipping_v1';
const TAX_RATE = 0.15;
const FLAT_SHIPPING_BANI = 5000; // 50 Lei (B+C decision: flat shipping for now)

function loadSavedAddress(): ShippingAddress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SHIPPING_ADDRESS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.error('Failed to load saved address:', error);
  }
  return DEFAULT_SHIPPING_ADDRESS;
}

type Errors = Partial<Record<keyof ShippingAddress, string>>;

function validate(addr: ShippingAddress): Errors {
  const errors: Errors = {};
  if (!addr.email) errors.email = 'E-mail este obligatoriu';
  else if (!/^\S+@\S+\.\S+$/.test(addr.email)) errors.email = 'E-mail invalid';

  if (!addr.phone) errors.phone = 'Telefon este obligatoriu';
  else if (addr.phone.replace(/\D/g, '').length < 7) errors.phone = 'Telefon invalid';

  if (!addr.firstName.trim()) errors.firstName = 'Prenume este obligatoriu';
  if (!addr.lastName.trim()) errors.lastName = 'Nume este obligatoriu';
  if (!addr.address.trim()) errors.address = 'Adresă este obligatorie';
  if (!addr.city.trim()) errors.city = 'Oraș este obligatoriu';

  if (addr.country !== 'MD' && (addr.postalCode || '').trim().length < 3) {
    errors.postalCode = 'Cod poștal este obligatoriu';
  }

  return errors;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();
  const { toast } = useToast();
  const { mdlPerEur } = useFxRate();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(loadSavedAddress);
  const [touched, setTouched] = useState<Partial<Record<keyof ShippingAddress, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  // Auto-save on every change (silent — no checkbox per Q1)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shippingAddress));
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  }, [shippingAddress]);

  const errors = useMemo(() => validate(shippingAddress), [shippingAddress]);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * 100 * item.quantity,
      0,
    );
    const shipping = FLAT_SHIPPING_BANI;
    const country = shippingAddress.country;
    const vat = calculateVatBani(subtotal, country);
    const total = subtotal + shipping + vat;
    const taxIncluded = country === 'MD'
      ? Math.round(total * (TAX_RATE / (1 + TAX_RATE)))
      : 0;
    return { subtotal, shipping, vat, total, taxIncluded };
  }, [items, shippingAddress.country]);

  const onBlur = (field: keyof ShippingAddress) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const fieldsWithErrors = Object.keys(errors).filter(
      (k) => errors[k as keyof Errors],
    );

    if (fieldsWithErrors.length > 0) {
      const firstField = fieldsWithErrors[0];
      const target = document.getElementById(`field-${firstField}`);
      target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      target?.querySelector<HTMLInputElement>('input')?.focus();
      return;
    }

    if (items.length === 0) return;

    const orderInput: CreateOrderInput = {
      customer_email: shippingAddress.email,
      customer_phone: shippingAddress.phone,
      customer_name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      shipping_address: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      },
      shipping_method_id: 'standard',
      newsletter_opt_in: false, // newsletter cut from UI per Q1; default false
    };

    createOrder(
      {
        input: orderInput,
        cartItems: items,
        shippingCost: totals.shipping,
        vatCost: totals.vat,
      },
      {
        onSuccess: (order) => {
          clearCart();
          toast({ title: 'Comanda a fost plasată cu succes' });
          navigate(`/orders/${order.id}`);
        },
        onError: (err: unknown) => {
          console.error('Order creation failed:', err);
          toast({
            title: 'Comanda nu a fost plasată',
            description: 'A apărut o eroare. Încearcă din nou.',
            variant: 'destructive',
          });
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Seo
        title="Checkout | modestshop"
        description="Plasează comanda — modestshop"
        image=""
        url=""
        type="website"
      />
      <Header />

      <main className="flex-1 pb-24 lg:pb-0">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12">
          <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-12">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7">
              <CheckoutForm
                shippingAddress={shippingAddress}
                onChange={setShippingAddress}
                errors={errors}
                touched={touched}
                onBlur={onBlur}
                submitted={submitted}
                onSubmit={handleSubmit}
                isSubmitting={isCreatingOrder}
                cartIsEmpty={items.length === 0}
              />
            </div>
            <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start order-first lg:order-none">
              <OrderSummary
                items={items}
                totals={totals}
                country={shippingAddress.country}
                mdlPerEur={mdlPerEur}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <MobileSubmitBar
        total={totals.total}
        country={shippingAddress.country}
        mdlPerEur={mdlPerEur}
        onSubmit={handleSubmit}
        isSubmitting={isCreatingOrder}
        itemCount={items.length}
      />
    </div>
  );
};

export default Checkout;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success. The build catches any unused imports from the previous file (Checkbox, Newsletter UI, Save Address checkbox state, AVAILABLE_SHIPPING_METHODS, etc.) — all gone in the new content.

If `tsc` complains about `useCreateOrder` argument type — verify it accepts `vatCost` (sub-project B+C added that). The parameter should already exist as `vatCost?: number` (default 0).

- [ ] **Step 3: Save point**

Checkout.tsx restructured. ~210 lines down from ~600+. Mobile sticky bar in place; desktop summary sticky-right; form sectioned with eyebrows.

---

## Task 3: Full verification + manual QA

**Files:** none modified.

- [ ] **Step 1: Final build**

Run: `npm run build`
Expected: success.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`
Vite serves at `http://localhost:5173`.

- [ ] **Step 3: Manual QA — desktop**

Add a product to the cart, navigate to `/checkout`. Mark ✅/❌:

1. **Page H1** `Checkout` visible at top.
2. **Two-column layout**: form on left (cols 1–7), summary on right (cols 8–12).
3. **Summary sticky** — scroll page; summary stays visible. Sticky offset clears the header.
4. **Form sections with eyebrows**: `Contact` and `Adresă de livrare`. No card wrappers around the form.
5. **Contact row**: Email and Phone side-by-side at desktop width.
6. **Address row 1**: Prenume + Nume side-by-side.
7. **Address row 2**: Adresă (full width).
8. **Address row 3**: Oraș + Cod poștal side-by-side.
9. **Country select**: full-width row, 28 options (MD + 27 EU).
10. **Submit button** (`Plasează comanda`) at the bottom of the form, full-width, primary mocha.

**No** newsletter opt-in checkbox.
**No** save-address checkbox.
**No** shipping-method select (it's a single line in the summary instead).

- [ ] **Step 4: Manual QA — validation**

11. Tap a field, leave it empty, blur (tab away) → error message in mocha-error red appears below the field.
12. Click submit with empty fields → all fields show errors at once; page scrolls to and focuses the first errored field.
13. Fix errors → error messages disappear individually as you fix them.
14. Email field invalid format → "E-mail invalid" message.
15. Phone field with < 7 digits → "Telefon invalid" message.
16. Country = MD with empty postal code → no error (MD allows empty).
17. Country = DE with empty postal code → "Cod poștal este obligatoriu" error.

- [ ] **Step 5: Manual QA — order summary**

18. Summary shows `În coș` eyebrow + line items (image + name + size × qty + price).
19. **Country = MD**: Subtotal · Transport · ShippingEstimate · Total in MDL · "Inclusiv X Lei din taxe" footnote. No VAT row, no EUR estimate.
20. **Country = DE**: VAT row appears (`TVA Germania (19%): X Lei`); EUR estimate (`MDL · ≈ €X.XX`); footnote disappears.
21. Switch country MD → DE → HU → MD → totals + visibility update live.

- [ ] **Step 6: Manual QA — mobile**

Resize browser to ~375px:

22. **Summary card on top** (above the form), full-width.
23. **Form below**, single column, full-width fields.
24. **Sticky bottom bar**: appears at viewport bottom with Total + EUR estimate (if non-MD) on left, `Plasează comanda` button on right.
25. **Bar respects safe-area-inset-bottom** (try iPhone simulator if possible; on desktop devtools mobile emulation it will simply have padding-bottom equal to 0).
26. **No** desktop submit button visible at the form bottom.
27. **Page bottom padding** sufficient — last form field not covered by sticky bar.
28. **Empty cart**: navigate to `/checkout` with cart empty → summary shows `Coșul este gol.` with `Înapoi la Magazin` ghost button; form hidden; mobile bar hidden.

- [ ] **Step 7: Manual QA — submit + persistence**

29. Fill the form → click submit → order created → redirect to `/orders/<orderId>`. Toast `Comanda a fost plasată cu succes`.
30. With country = DE filled in, place an order → confirmation page reflects the elevated total (subtotal + shipping + VAT).
31. After order success, return to `/checkout` → cart is empty → summary shows empty state.
32. Reload `/checkout` with form half-filled → form re-hydrates from localStorage.

- [ ] **Step 8: Stop dev server**

Ctrl-C the running `npm run dev`.

- [ ] **Step 9: Final save point**

Checkout redesign complete. 1 modified + 3 new files. Page is ~210 lines orchestration + 3 focused components.

---

## Self-review notes (plan author)

- **Spec coverage:**
  - Decision 1 (single job — friction reduction) → reflected in Tasks 1 (cuts) and 2 (auto-save behavior)
  - Decision 2 (cut newsletter) → Task 1 (no checkbox in CheckoutForm) + Task 2 (`newsletter_opt_in: false` hardcoded in submit handler)
  - Decision 3 (cut save-address checkbox; auto-save silent) → Task 2 (`useEffect` on shippingAddress writes to localStorage every change)
  - Decision 4 (cut shipping-method select) → Task 1 (no select in CheckoutForm) + Task 2 (flat `FLAT_SHIPPING_BANI` constant) + Task 1 OrderSummary shows `Transport` line as static
  - Decision 5 (single-block form with row groupings) → Task 1 CheckoutForm row layouts
  - Decision 6 (sticky right summary desktop / top mobile) → Task 2 page layout with `lg:sticky` and `order-first lg:order-none`
  - Decision 7 (submit button bottom on desktop, sticky bar mobile) → Task 1 CheckoutForm (`hidden lg:flex` desktop button) + Task 1 MobileSubmitBar (sticky on `< lg`)
- **Placeholders:** None. Every code-changing step shows full code. Task 3 has 32 concrete QA checks.
- **Type/name consistency:** `ShippingAddress`, `Errors`, `CartItem`, `Totals`, `EU_COUNTRY_LABELS`, `EuCountryCode`, `calculateVatBani`, `getVatRate`, `formatPrice`, `formatCheckoutPrice`, `useFxRate`, `useCreateOrder`, `useCart` — all used verbatim across tasks. Field names (`email`, `phone`, `firstName`, `lastName`, `address`, `city`, `postalCode`, `country`) match the existing `ShippingAddress` interface in `src/types/checkout.ts`.
- **One assumption** documented in Task 2 Step 2: `useCreateOrder` already accepts `vatCost?: number` (default 0) per sub-project B+C. If the existing signature differs, the engineer adapts.
