// POST /api/maib/callback: maib back-channel notification (HMAC signed).
import { signatureKey, verifyCallbackSignature } from '../_lib/maib';
import { supabaseAdmin } from '../_lib/supabaseAdmin';
import { json, markPaid, type PaymentRow } from '../_lib/payments';

interface CallbackBody {
  checkoutId?: string;
  paymentId?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  paymentStatus?: string;
  amount?: number;
  currency?: string;
}

export async function POST(request: Request): Promise<Response> {
  // Signature is computed over the exact bytes received, so read the raw text.
  const raw = await request.text();
  const valid = verifyCallbackSignature(
    raw,
    request.headers.get('x-signature'),
    request.headers.get('x-signature-timestamp'),
    signatureKey(),
  );
  if (!valid) {
    console.warn('maib callback: invalid signature');
    return json({ error: 'invalid_signature' }, 401);
  }

  let body: CallbackBody;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  const db = supabaseAdmin();
  const { data: payment, error } = await db
    .from('payments')
    .select('*')
    .eq('checkout_id', body.checkoutId ?? '')
    .maybeSingle();
  if (error) {
    console.error('maib callback lookup failed', error);
    return json({ error: 'lookup_failed' }, 500); // let maib retry
  }
  if (!payment) {
    console.warn('maib callback: unknown checkout', body.checkoutId);
    return json({ ok: true });
  }

  const row = payment as PaymentRow;
  if (String(body.paymentStatus).toLowerCase() !== 'executed' || !body.paymentId) {
    await db
      .from('payments')
      .update({ raw: body, updated_at: new Date().toISOString() })
      .eq('id', row.id);
    return json({ ok: true });
  }

  try {
    await markPaid(db, row, {
      paymentId: body.paymentId,
      amount: Number(body.paymentAmount ?? body.amount),
      currency: String(body.paymentCurrency ?? body.currency),
      raw: body,
    });
  } catch (err) {
    // Amount mismatch is logged and stored on the payment; don't make maib retry it.
    console.error('maib callback: could not mark paid', err);
  }
  return json({ ok: true });
}
