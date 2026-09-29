# maib Checkout: online card payments

Date: 2026-09-29 · Status: implemented on branch `feat/maib-checkout`, sandbox only, not merged

## Goal

Let customers pay for an order online by card (plus Apple Pay, Google Pay and MIA QR, which maib's hosted page offers) through **maib e-Commerce Checkout**. maib also asked for two validation tests in their sandbox: (1) one successful payment and (2) a refund of that payment, followed by short feedback.

## What the user asked for vs. what I assumed

- **Asked:** "setup this for our project live on vercel", with the sandbox credentials and test card from maib. Work on autopilot; the user reviews the final docs.
- **Assumed (please check):**
  1. Online payment is **an additional option**. Placing an order and confirming on WhatsApp stays available. That is how the shop works today (the "Checkout does not process payments online" memory note).
  2. The card charge covers **products + VAT** (the total the checkout already shows). Delivery is free in Chișinău. Outside Chișinău, delivery is confirmed and paid separately via WhatsApp, as it is now. The checkout says this next to the card option.
  3. Currency is **MDL** (maib Checkout only supports MDL). EU customers see their EUR estimate as today, but they are charged the MDL total.
  4. Refunds are done by an **admin, from the admin order page**, full amount only (YAGNI on partial refunds).
  5. Nothing is merged to `main` or deployed to production until the user reviews. The Vercel project (`startduck/modest.shops`, https://modestshops.vercel.app) belongs to a team this machine's Vercel CLI can't access, so the user sets the env vars (steps in `docs/payments-maib.md`).

## Architecture

The keys must never reach the browser. The frontend is a static Vite SPA, so the payment logic lives in **Vercel Functions** (`/api/*`, Node runtime, Web `Request`/`Response` handlers).

```
Browser                      Vercel Function                          maib                Supabase
Checkout ─ create order (existing, anon insert) ─────────────────────────────────────────▶ orders/order_items
         ─ POST /api/maib/create {orderId} ─▶ re-price order from DB ────────────────────▶ skus / discovery_set_configs
                                             POST /v2/checkouts ──────▶ checkoutUrl
                                             insert payments row ──────────────────────────▶ payments
         ◀── { checkoutUrl } ── redirect ──────────────────────────────▶ hosted payment page
maib ─ POST /api/maib/callback (HMAC signed) ▶ verify signature + amount, mark paid ───────▶ payments, orders.status='paid'
Browser ◀── redirect to /{lang}/orders/{id}?payment=return
         ─ GET /api/maib/status?orderId= ───▶ if still pending: GET /v2/checkouts/{id} (reconcile) ─▶ payments/orders
Admin    ─ POST /api/maib/refund {orderId} (Supabase JWT) ▶ is admin? POST /v2/payments/{payId}/refund ▶ orders.status='refunded'
```

### Server modules (`api/_lib/`)
- `maib.ts`: token (cached until ~30 s before expiry), `createCheckout`, `getCheckout`, `refundPayment`, `verifyCallbackSignature` (HMAC-SHA256 over `{rawBody}.{timestamp}`, base64, constant-time compare, max 10 min clock skew).
- `supabaseAdmin.ts`: service-role client. **Server only**, read from `SUPABASE_SERVICE_ROLE_KEY`, never `VITE_`-prefixed, so it's never in the bundle. This is consistent with SECURITY_SETUP.md, which forbids the key in the *frontend*.
- `pricing.ts`: recomputes the amount to charge from DB prices, never from the client.

### Price integrity
Today's checkout inserts `order_items` with client-supplied prices (anon insert is allowed by RLS). Without a check, someone could create a 1 MDL order for a 3000 MDL product and pay 1 MDL. `create` therefore re-prices every line from `skus.price` / `discovery_set_configs.base_price`, using the cart's rounding to whole lei, then adds VAT with the same `calculateVatBani`. It refuses (409) if the stored `orders.total_bani` differs, and charges the server-computed amount.

### Endpoints
| Endpoint | Auth | Behaviour |
|---|---|---|
| `POST /api/maib/create` | none (order UUID is the capability) | Order must exist, have `payment_method='card'` and not be paid. Re-prices, reuses an unpaid checkout less than 15 min old, otherwise registers a new one. Returns `checkoutUrl`. |
| `POST /api/maib/callback` | HMAC signature | Verifies the signature and timestamp, matches `checkoutId` to a `payments` row, checks amount/currency, sets payment `paid` + order `paid`. Idempotent. Always returns 200 once verified so maib doesn't retry forever. |
| `GET /api/maib/status?orderId=` | none | Returns the payment state. If still `pending`, asks maib for checkout details and reconciles, in case the callback was lost or delayed. |
| `POST /api/maib/refund` | Supabase access token + `admin_users` row | Full refund of the paid payment. Sets payment `refunded` (+ `refund_id`) and order `refunded`. |

### Data (`supabase/migrations/012_maib_payments.sql`)
- `orders.payment_method text not null default 'offline'` (`offline` | `card`).
- New table `payments`: `order_id`, `provider`, `checkout_id` (unique), `payment_id`, `amount_bani`, `currency`, `status` (`pending|paid|failed|refunded`), `refund_id`, `refunded_at`, `raw` (jsonb, last maib payload), timestamps. RLS on, admins can `select`; no anon access (functions use the service role).

### Frontend
- Checkout: a payment method choice. **Card online (maib)** is the default; **Order now, pay on WhatsApp confirmation** is the existing flow. For card: create order → `POST /api/maib/create` → `window.location` to maib. The cart is cleared once the order exists; if payment fails, the order page offers "Retry payment".
- Order page: when the order is a card order, shows the payment state (paid / processing / failed + retry button) via `/api/maib/status`.
- Admin order details: payment panel with a **Refund** button for paid card orders.
- Copy in ro/ru/en.
- `vercel.json`: the SPA catch-all rewrite now skips `/api/`.

## Config (Vercel → Project → Settings → Environment Variables)
| Name | Value |
|---|---|
| `MAIB_API_BASE` | `https://sandbox.maibmerchants.md` (switch to `https://api.maibmerchants.md` with production keys) |
| `MAIB_CLIENT_ID` / `MAIB_CLIENT_SECRET` / `MAIB_SIGNATURE_KEY` | from maib |
| `SUPABASE_URL` | same as `VITE_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (server only!) |
| `PUBLIC_SITE_URL` | optional; defaults to the request's origin (see `docs/payments-maib.md`) |

## Testing
No test runner exists in the repo. Verification:
- `scripts/maib/verify-signature.ts`: checks our verifier against maib's documented example vector.
- `scripts/maib/sandbox-e2e.ts`: runs against the real sandbox: token → register checkout → (pay on the hosted page with the test card) → poll details → refund → refund details. This produces the evidence maib asked for.
- `tsc` + `vite build` pass. The pre-existing `tsconfig.app.json` errors (6, same on `main`) and the broken ESLint config (`next/core-web-vitals`) are unchanged.
- The checkout UI was checked in headless Chromium (desktop + mobile).

## Out of scope
Partial refunds, paying for delivery online, EUR charging, saved cards, automatic emails.
