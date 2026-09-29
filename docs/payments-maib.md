# Online payments with maib Checkout

Card payments go through maib's hosted checkout page. The browser never sees the maib keys; they live only in Vercel Functions under `/api/maib/*`. Design notes: `docs/superpowers/specs/2026-09-29-maib-checkout-design.md`.

## How it works

1. At checkout the customer chooses **Card bancar online** (default) or **Plată la confirmare** (the existing WhatsApp flow).
2. For card orders, the order is saved first, then `POST /api/maib/create` re-prices the order from the catalogue, registers a maib checkout and sends the customer to maib's page.
3. maib returns the customer to `/{lang}/orders/{id}?payment=return` and notifies `POST /api/maib/callback` (HMAC-signed). The order becomes `paid`.
4. If the callback is late or lost, the order page asks `GET /api/maib/status`, which checks with maib directly.
5. Refunds: Admin → order → **Online payment (maib)** → *Refund full amount*.

## Go-live checklist

**0. Blockers found on 2026-09-29, unrelated to payments but they stop the live store:**
- **The Supabase project `wbfdlftndrmjlqudegml` does not resolve in DNS.** It is probably paused or deleted. Restore or unpause it in the Supabase dashboard, or point the env vars at the current project. Confirmed in a browser: https://modestshops.vercel.app/ro/shop shows "Catalogul este momentan gol" (0 produse) because every Supabase request fails with `ERR_NAME_NOT_RESOLVED`. Customers currently see an empty store and can't order. Note: `SUPABASE_ACCESS_TOKEN` in `fragrance-shop-main/.env` is actually the project's `anon` key, not an account token, so it can't be used to check or restore the project. A personal access token (`sbp_…`, from supabase.com/dashboard/account/tokens) is needed for that.
- **`modestshop.md` points to Netlify, not Vercel.** Netlify serves a `*.netlify.app` certificate, so browsers show a certificate error, and `modestshop.netlify.app` returns 404. The working Vercel deployment is https://modestshops.vercel.app (team `startduck`, project `modest.shops`). To serve the domain from Vercel, add `modestshop.md` + `www` under Vercel → Project → Domains and update the DNS records at your registrar as Vercel instructs.

**1. Database:** paste `supabase/migrations/012_maib_payments.sql` into the Supabase SQL Editor and run it. It adds `orders.payment_method`, the `payments` table, and only lets guests insert orders with status `pending`.

**2. Vercel env vars** (Project → Settings → Environment Variables, Production + Preview). **None of these may start with `VITE_`**, because that would ship them to the browser.

| Name | Value |
|---|---|
| `MAIB_API_BASE` | `https://sandbox.maibmerchants.md` for now; `https://api.maibmerchants.md` with production keys |
| `MAIB_CLIENT_ID` | from maib |
| `MAIB_CLIENT_SECRET` | from maib |
| `MAIB_SIGNATURE_KEY` | from maib |
| `SUPABASE_URL` | same value as `VITE_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` |
| `PUBLIC_SITE_URL` | optional. Leave unset and the return/callback URLs use whichever domain the customer is on; set it (e.g. `https://modestshop.md`) to pin one. |

With the CLI, from an account that can access the `startduck` team: `vercel link` → `vercel env add MAIB_CLIENT_SECRET production` (repeat for each).

**3. Deploy:** merge `feat/maib-checkout` into `main` (Vercel deploys it automatically), or push the branch first to get a preview URL.

**4. Smoke test on the preview/production URL** (sandbox keys, so no real money moves): add a product → checkout → Card → pay with the test card below → you land on the order page with "Plata a fost efectuată" → in Admin, the order is `paid` → *Refund full amount* → order becomes `refunded`.

**5. Switch to production:** once maib certifies the integration, replace the three `MAIB_*` keys with production ones and set `MAIB_API_BASE=https://api.maibmerchants.md`. Redeploy.

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
