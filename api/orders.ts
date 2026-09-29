// GET /api/orders?id=<uuid> -> { order, items }
// Guests can't read orders through Supabase (RLS), so the order page loads
// here. The order UUID is the capability: only the customer who placed the
// order (and got the link) knows it, same as /api/maib/status.
import { supabaseAdmin } from './_lib/supabaseAdmin';
import { isUuid, json } from './_lib/payments';

const ORDER_COLUMNS =
  'id, user_id, status, payment_method, currency, customer_email, customer_phone, customer_name, shipping_address, shipping_bani, subtotal_bani, total_bani, created_at, updated_at';

export async function GET(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get('id');
  if (!isUuid(id)) return json({ error: 'invalid_order' }, 400);

  try {
    const db = supabaseAdmin();
    const { data: order, error } = await db.from('orders').select(ORDER_COLUMNS).eq('id', id).maybeSingle();
    if (error) throw error;
    if (!order) return json({ error: 'order_not_found' }, 404);

    const { data: items, error: itemsError } = await db
      .from('order_items')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true });
    if (itemsError) throw itemsError;

    return json({ order, items: items ?? [] });
  } catch (err) {
    console.error('order lookup failed', err);
    return json({ error: 'lookup_failed' }, 500);
  }
}
