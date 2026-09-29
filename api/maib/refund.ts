// POST /api/maib/refund { orderId, reason? }: admin only, full refund.
import { MaibError, refundPayment } from '../_lib/maib';
import { requireAdmin, supabaseAdmin } from '../_lib/supabaseAdmin';
import { isUuid, json, latestPayment } from '../_lib/payments';

export async function POST(request: Request): Promise<Response> {
  const adminId = await requireAdmin(request).catch(() => null);
  if (!adminId) return json({ error: 'forbidden' }, 403);

  const body = (await request.json().catch(() => null)) as { orderId?: unknown; reason?: unknown } | null;
  const orderId = body?.orderId;
  if (!isUuid(orderId)) return json({ error: 'invalid_order' }, 400);
  const reason = typeof body?.reason === 'string' && body.reason.trim() ? body.reason.trim() : 'Rambursare comandă';

  try {
    const db = supabaseAdmin();
    const payment = await latestPayment(db, orderId);
    if (!payment || payment.status !== 'paid' || !payment.payment_id) {
      return json({ error: 'not_refundable' }, 409);
    }

    const refund = await refundPayment(payment.payment_id, payment.amount_bani / 100, reason);
    const now = new Date().toISOString();
    const { error } = await db
      .from('payments')
      .update({ status: 'refunded', refund_id: refund.refundId, refunded_at: now, updated_at: now })
      .eq('id', payment.id);
    if (error) throw error;
    const { error: orderError } = await db
      .from('orders')
      .update({ status: 'refunded', updated_at: now })
      .eq('id', orderId);
    if (orderError) throw orderError;

    return json({ refundId: refund.refundId, status: refund.status });
  } catch (err) {
    console.error('maib refund failed', err instanceof MaibError ? { message: err.message, body: err.body } : err);
    return json({ error: 'refund_failed', message: err instanceof Error ? err.message : undefined }, 502);
  }
}
