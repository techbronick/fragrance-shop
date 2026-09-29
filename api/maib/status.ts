// GET /api/maib/status?orderId=... -> { status: 'none' | PaymentStatus }
import { supabaseAdmin } from '../_lib/supabaseAdmin';
import { isUuid, json, latestPayment, reconcile } from '../_lib/payments';

export async function GET(request: Request): Promise<Response> {
  const orderId = new URL(request.url).searchParams.get('orderId');
  if (!isUuid(orderId)) return json({ error: 'invalid_order' }, 400);

  try {
    const db = supabaseAdmin();
    let payment = await latestPayment(db, orderId);
    if (!payment) return json({ status: 'none' });
    if (payment.status === 'pending') {
      payment = await reconcile(db, payment).catch((err) => {
        console.error('maib reconcile failed', err);
        return payment!;
      });
    }
    return json({ status: payment.status });
  } catch (err) {
    console.error('maib status failed', err);
    return json({ error: 'status_failed' }, 500);
  }
}
