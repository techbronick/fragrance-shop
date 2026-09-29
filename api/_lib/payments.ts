// Shared payment-state transitions for the maib endpoints.
import type { SupabaseClient } from '@supabase/supabase-js';
import { getCheckout, type CheckoutDetails } from './maib';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PaymentRow {
  id: string;
  order_id: string;
  checkout_id: string;
  checkout_url: string | null;
  payment_id: string | null;
  amount_bani: number;
  currency: string;
  status: PaymentStatus;
  refund_id: string | null;
  created_at: string;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export const isUuid = (v: unknown): v is string =>
  typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export async function latestPayment(db: SupabaseClient, orderId: string): Promise<PaymentRow | null> {
  const { data, error } = await db
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as PaymentRow | null;
}

/** Marks a payment (and its order) paid. Rejects amount/currency mismatches. Idempotent. */
export async function markPaid(
  db: SupabaseClient,
  payment: PaymentRow,
  paid: { paymentId: string; amount: number; currency: string; raw: unknown },
): Promise<PaymentRow> {
  if (payment.status === 'paid' || payment.status === 'refunded') return payment;

  const paidBani = Math.round(paid.amount * 100);
  if (paidBani !== payment.amount_bani || paid.currency !== payment.currency) {
    console.error('maib amount mismatch', { checkout: payment.checkout_id, paidBani, expected: payment.amount_bani });
    await db.from('payments').update({ raw: paid.raw, updated_at: new Date().toISOString() }).eq('id', payment.id);
    throw new Error('Paid amount does not match the order');
  }

  const now = new Date().toISOString();
  const { data, error } = await db
    .from('payments')
    .update({ status: 'paid', payment_id: paid.paymentId, paid_at: now, raw: paid.raw, updated_at: now })
    .eq('id', payment.id)
    .select('*')
    .single();
  if (error) throw error;
  const { error: orderError } = await db
    .from('orders')
    .update({ status: 'paid', updated_at: now })
    .eq('id', payment.order_id);
  if (orderError) throw orderError;
  return data as PaymentRow;
}

async function markFailed(db: SupabaseClient, payment: PaymentRow, raw: unknown): Promise<PaymentRow> {
  const { data, error } = await db
    .from('payments')
    .update({ status: 'failed', raw, updated_at: new Date().toISOString() })
    .eq('id', payment.id)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return (data as PaymentRow | null) ?? payment;
}

const FAILED_CHECKOUT = new Set(['expired', 'abandoned', 'cancelled', 'failed']);

/** Asks maib for the checkout state and applies it; covers lost or delayed callbacks. */
export async function reconcile(db: SupabaseClient, payment: PaymentRow): Promise<PaymentRow> {
  if (payment.status !== 'pending') return payment;
  const details: CheckoutDetails = await getCheckout(payment.checkout_id);
  const status = String(details.status || '').toLowerCase();
  const p = details.payment as (CheckoutDetails['payment'] & { PaymentId?: string }) | null | undefined;
  const paymentId = p?.paymentId || p?.PaymentId;

  if (status === 'completed' && paymentId && String(p?.status).toLowerCase() === 'executed') {
    return markPaid(db, payment, {
      paymentId,
      amount: Number(p?.amount ?? details.amount),
      currency: String(p?.currency ?? details.currency),
      raw: details,
    });
  }
  if (FAILED_CHECKOUT.has(status)) return markFailed(db, payment, details);
  return payment;
}
