# Online payments with maib Checkout

Card payments go through maib's hosted checkout page. The browser never sees the maib keys; they live only in Vercel Functions under `/api/maib/*`. Design notes: `docs/superpowers/specs/2026-09-29-maib-checkout-design.md`.

## How it works

1. At checkout the customer chooses **Card bancar online** (default) or **Plată la confirmare** (the existing WhatsApp flow).
2. For card orders, the order is saved first, then `POST /api/maib/create` re-prices the order from the catalogue, registers a maib checkout and sends the customer to maib's page.
3. maib returns the customer to `/{lang}/orders/{id}?payment=return` and notifies `POST /api/maib/callback` (HMAC-signed). The order becomes `paid`.
4. If the callback is late or lost, the order page asks `GET /api/maib/status`, which checks with maib directly.
5. Refunds: Admin → order → **Online payment (maib)** → *Refund full amount*.

## Go-live checklist

**0. Found on 2026-09-29, unrelated to payments:**
- ~~Supabase project `wbfdlftndrmjlqudegml` unreachable~~ **Resolved 2026-09-29 14:48.** The project was restored with all its data (4,264 products, 23,506 SKUs, 23 orders); the live shop lists products again. Note: `SUPABASE_ACCESS_TOKEN` in `fragrance-shop-main/.env` is really the `anon` key, not an account token.
- **`modestshop.md` points to Netlify, not Vercel.** Netlify serves a `*.netlify.app` certificate, so browsers show a certificate error, and `modestshop.netlify.app` returns 404. The working Vercel deployment is https://modestshops.vercel.app (team `startduck`, project `modest.shops`). To serve the domain from Vercel, add `modestshop.md` + `www` under Vercel → Project → Domains and update the DNS records at your registrar as Vercel instructs.

**1. Database: ✅ done 2026-09-29** (via the Management API). `012_maib_payments.sql` added `orders.payment_method` (the 23 existing orders became `offline`) and the `payments` table (RLS on, admins read-only). It also replaced the **six** permissive INSERT policies found on `orders`, all `WITH CHECK true` and some misnamed `*_order_items`, with one rule: `status = 'pending' OR is_admin()`. Verified as `anon` in rolled-back transactions: inserting a `paid` order is rejected, inserting a `pending` card order works, and `payments` is invisible.

> ⚠️ **Existing privacy issue (not changed):** the SELECT policy on `orders` is `auth.uid() = user_id OR is_admin() OR user_id IS NULL`, and `order_items` mirrors it. So anyone holding the public anon key (it's in the site's JS) can list **every guest order** with names, emails, phones and addresses. The order confirmation page relies on this. Fix: serve guest order lookups through a server endpoint (like `/api/maib/status`) and drop `OR user_id IS NULL`. Recommended soon, as a separate change.

**2. Vercel env vars: ✅ done 2026-09-29** for Production + Preview, all marked sensitive: `MAIB_API_BASE` (sandbox), `MAIB_CLIENT_ID`, `MAIB_CLIENT_SECRET`, `MAIB_SIGNATURE_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. **None may start with `VITE_`**, because that would ship them to the browser. `PUBLIC_SITE_URL` is optional; when unset, return/callback URLs use the domain the customer is on.

**Card-payment switch:** the card option only appears when `VITE_CARD_PAYMENTS=on`. That's set for **Preview only**, so production keeps the WhatsApp-only checkout while the keys are sandbox ones. Otherwise real customers would be sent to maib's test environment.

**3. Preview test: ✅ passed 2026-09-29** on a deployed preview against the **real database** + maib sandbox (`scripts/maib/preview-e2e.ts`):
- test order created as a guest
- a guest "paid" insert was rejected
- the preview registered the checkout and the test card paid it
- the order became `paid`
- refund without an admin session → 403; admin refund → `refunded`
- test rows deleted afterwards

The admin session was created via a one-time magic link generated with the service key; no email was sent. The maib → `/api/maib/callback` delivery can't reach a preview (they're behind Vercel Authentication), so its first real delivery will be in production. The status endpoint covers it if it fails.

**4. Merged to `main`: ✅ done 2026-09-29** ([PR #1](https://github.com/techbronick/fragrance-shop/pull/1), merge `3b974c9`). Production (https://modestshops.vercel.app) is serving it. The card option is hidden there (`VITE_CARD_PAYMENTS` unset), and `/api/maib/*` responds: status 200, unsigned callback 401, refund without admin 403.

**5. Go live, once maib sends production keys:** in Vercel → Environment Variables (Production), replace the three `MAIB_*` keys, set `MAIB_API_BASE=https://api.maibmerchants.md`, add `VITE_CARD_PAYMENTS=on`, and redeploy. Then make one small real purchase and refund it from Admin.

## Test card (sandbox)

Cardholder `Test Test` · `5102 1800 6010 1124` · `06/28` · CVV `760`

## Running the tests locally

```bash
# Signature check against maib's documented example
npx tsx scripts/maib/verify-signature.ts

# Full sandbox run: real endpoints + real maib sandbox, in-memory database.
# Pays with the test card in headless Chromium, then refunds as admin.
MAIB_CLIENT_ID=... MAIB_CLIENT_SECRET=... MAIB_SIGNATURE_KEY=... \
  npx tsx scripts/maib/sandbox-e2e.ts
```

The e2e script refuses to run unless `MAIB_API_BASE` points at the sandbox.

## Sandbox run of 2026-09-29 (maib's two requested tests)

| | Result |
|---|---|
| Checkout | `a91a94a6-a6e0-4a9c-94e3-37dcf99af98b`, 599.00 MDL, status `Completed` |
| 1. Payment | `paymentId 93f092ef-5a44-4ec1-abad-c0bff93be368`, status `Executed`, approval `727225`, RRN `627209753398`, terminal `0149587` |
| 2. Refund | `refundId d33e5791-d42b-4703-811b-e4333f18610c`, type `Full`, 599.00 MDL, status `Accepted`; the payment then shows `Refunded`, `refundedAmount 599` |

### Draft feedback for maib (RO)

> Bună ziua,
>
> Am finalizat testele de integrare maib Checkout în mediul sandbox:
>
> 1. **Plată cu succes:** checkout `a91a94a6-a6e0-4a9c-94e3-37dcf99af98b`, 599,00 MDL, cardul de test; plata `93f092ef-5a44-4ec1-abad-c0bff93be368` a fost executată (status Executed, cod aprobare 727225, RRN 627209753398). Clientul a fost redirecționat corect pe pagina de succes.
> 2. **Refund:** rambursare integrală pentru aceeași plată, refund `d33e5791-d42b-4703-811b-e4333f18610c`, status Accepted; plata apare ulterior cu status Refunded.
>
> Notificările callback sunt verificate prin semnătura HMAC-SHA256 (X-Signature / X-Signature-Timestamp). O observație: cererile GET către `/v2/checkouts/{id}` care includ antetul `Content-Type: application/json` primesc 403 (supportID în răspuns); fără acest antet funcționează corect.
>
> Vă rugăm să ne comunicați pașii pentru trecerea în producție.
>
> Mulțumim!

## Known limits

- Full refunds only; partial refunds can be added later with the same endpoint.
- Online payment covers products + VAT. Delivery outside Chișinău is still confirmed and paid on WhatsApp (the checkout says so).
- maib charges in MDL only; EU customers see a EUR estimate but pay the MDL amount.
- The real maib → `/api/maib/callback` delivery can only be observed once deployed. Locally it was tested with a correctly signed synthetic callback, and the status endpoint covers a missed callback anyway.
