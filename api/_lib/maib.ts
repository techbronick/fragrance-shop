// maib e-Commerce Checkout API client (server only).
// Docs: https://docs.maibmerchants.md/checkout
import { createHmac, timingSafeEqual } from 'node:crypto';

const SIGNATURE_MAX_SKEW_MS = 10 * 60 * 1000;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

function apiBase(): string {
  return (process.env.MAIB_API_BASE || 'https://sandbox.maibmerchants.md').replace(/\/$/, '');
}

interface MaibEnvelope<T> {
  ok: boolean;
  result?: T;
  errors?: Array<{ errorCode?: string; errorMessage?: string }> | null;
}

export class MaibError extends Error {
  constructor(message: string, readonly status: number, readonly body: unknown) {
    super(message);
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const res = await fetch(`${apiBase()}/v2/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: env('MAIB_CLIENT_ID'),
      clientSecret: env('MAIB_CLIENT_SECRET'),
    }),
  });
  const body = (await res.json().catch(() => null)) as MaibEnvelope<{
    accessToken: string;
    expiresIn: number;
    tokenType: string;
  }> | null;
  if (!res.ok || !body?.ok || !body.result) {
    throw new MaibError('maib auth failed', res.status, body);
  }
  // Refresh 30s before the token actually expires.
  cachedToken = {
    value: `${body.result.tokenType || 'Bearer'} ${body.result.accessToken}`,
    expiresAt: Date.now() + (body.result.expiresIn - 30) * 1000,
  };
  return cachedToken.value;
}

async function call<T>(method: 'GET' | 'POST', path: string, payload?: unknown): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    // maib's WAF rejects GET requests that carry a Content-Type header (403).
    headers: payload === undefined
      ? { Authorization: await getToken() }
      : { Authorization: await getToken(), 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => null)) as MaibEnvelope<T> | null;
  if (!res.ok || !body?.ok) {
    const detail = body?.errors?.map((e) => `${e.errorCode}: ${e.errorMessage}`).join('; ');
    throw new MaibError(`maib ${method} ${path} failed (${res.status})${detail ? `: ${detail}` : ''}`, res.status, body);
  }
  return body.result as T;
}

export interface CreateCheckoutInput {
  amount: number; // major units (lei)
  currency: 'MDL';
  orderInfo?: {
    id?: string;
    description?: string;
    date?: string;
    orderAmount?: number | null;
    orderCurrency?: string | null;
    deliveryAmount?: number | null;
    deliveryCurrency?: string | null;
    items?: Array<{
      externalId?: string;
      title?: string;
      amount?: number;
      currency?: string;
      quantity?: number;
    }>;
  };
  payerInfo?: { name?: string; email?: string; phone?: string; ip?: string; userAgent?: string };
  language?: 'ro' | 'ru' | 'en';
  callbackUrl?: string;
  successUrl?: string;
  failUrl?: string;
}

export function createCheckout(input: CreateCheckoutInput) {
  return call<{ checkoutId: string; checkoutUrl: string }>('POST', '/v2/checkouts', input);
}

// Only the fields we rely on; the full payload is stored raw.
export interface CheckoutDetails {
  id: string;
  status: string; // WaitingForInit | Initialized | PaymentMethodSelected | Completed | Expired | Abandoned | Cancelled | Failed ...
  amount: number;
  currency: string;
  payment?: {
    paymentId?: string;
    status?: string; // Executed | Failed | Refunded | PartiallyRefunded ...
    amount?: number;
    currency?: string;
  } | null;
  [key: string]: unknown;
}

export function getCheckout(checkoutId: string) {
  return call<CheckoutDetails>('GET', `/v2/checkouts/${encodeURIComponent(checkoutId)}`);
}

export function refundPayment(paymentId: string, amount: number, reason: string) {
  return call<{ refundId: string; status: string }>(
    'POST',
    `/v2/payments/${encodeURIComponent(paymentId)}/refund`,
    { amount, reason: reason.slice(0, 500) },
  );
}

export function getRefund(refundId: string) {
  return call<Record<string, unknown>>('GET', `/v2/payments/refunds/${encodeURIComponent(refundId)}`);
}

/**
 * Verify a back-channel callback: HMAC-SHA256(signatureKey, `${rawBody}.${timestamp}`),
 * base64, sent as `X-Signature: sha256=<sig>` with `X-Signature-Timestamp` (unix ms).
 */
export function verifyCallbackSignature(
  rawBody: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  signatureKey: string,
  now: number = Date.now(),
): boolean {
  if (!signatureHeader || !timestampHeader) return false;
  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > SIGNATURE_MAX_SKEW_MS) return false;

  const received = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice('sha256='.length)
    : signatureHeader;
  const expected = createHmac('sha256', signatureKey)
    .update(`${rawBody}.${timestampHeader}`, 'utf8')
    .digest('base64');

  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function signatureKey(): string {
  return env('MAIB_SIGNATURE_KEY');
}
