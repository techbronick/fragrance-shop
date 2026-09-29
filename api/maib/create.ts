// POST /api/maib/create { orderId, language? } -> { checkoutUrl }
// Registers a maib hosted checkout for an existing card order. The order UUID
// is the capability (same as the order confirmation page).
import { createCheckout, MaibError } from '../_lib/maib';
import { supabaseAdmin } from '../_lib/supabaseAdmin';
import { priceOrder } from '../_lib/pricing';
import { isUuid, json, latestPayment, reconcile } from '../_lib/payments';

const REUSE_CHECKOUT_MS = 15 * 60 * 1000; // maib sessions expire after ~25 min

function siteUrl(request: Request): string {
  return (process.env.PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
}

function toE164(phone: string | null): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  if (digits.startsWith('0') && digits.length === 9) return `+373${digits.slice(1)}`; // local MD number
  return undefined;
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as { orderId?: unknown; language?: unknown } | null;
  const orderId = body?.orderId;
  if (!isUuid(orderId)) return json({ error: 'invalid_order' }, 400);
  const language = (['ro', 'ru', 'en'] as const).find((l) => l === body?.language) ?? 'ro';

  try {
    const db = supabaseAdmin();
    const { data: order, error } = await db
      .from('orders')
      .select('id, status, payment_method, total_bani, currency, customer_name, customer_email, customer_phone, shipping_address, created_at')
      .eq('id', orderId)
      .maybeSingle();
    if (error) throw error;
    if (!order) return json({ error: 'order_not_found' }, 404);
    if (order.payment_method !== 'card') return json({ error: 'not_card_order' }, 409);
    if (!['pending', 'placed'].includes(order.status)) return json({ error: 'order_not_payable', status: order.status }, 409);

    // Reuse a recent unpaid session instead of stacking up checkouts.
    let existing = await latestPayment(db, orderId);
    if (existing?.status === 'pending') existing = await reconcile(db, existing);
    if (existing?.status === 'paid' || existing?.status === 'refunded') return json({ error: 'already_paid' }, 409);
    if (
      existing?.status === 'pending' &&
      existing.checkout_url &&
      Date.now() - new Date(existing.created_at).getTime() < REUSE_CHECKOUT_MS
    ) {
      return json({ checkoutUrl: existing.checkout_url });
    }

    const country = (order.shipping_address as { country?: string } | null)?.country || 'MD';
    const priced = await priceOrder(db, orderId, country);
    if (priced.totalBani !== order.total_bani) {
      console.error('Order total mismatch', { orderId, stored: order.total_bani, computed: priced.totalBani });
      return json({ error: 'price_mismatch' }, 409);
    }

    const site = siteUrl(request);
    const returnUrl = `${site}/${language}/orders/${orderId}?payment=return`;
    const shortId = orderId.slice(0, 8).toUpperCase();
    const checkout = await createCheckout({
      amount: priced.totalBani / 100,
      currency: 'MDL',
      orderInfo: {
        id: orderId,
        description: `modestshop #${shortId}`,
        date: new Date(order.created_at).toISOString(),
        orderAmount: priced.totalBani / 100,
        orderCurrency: 'MDL',
        items: priced.lines.map((l) => ({
          externalId: l.id,
          title: l.title,
          amount: l.unitBani / 100,
          currency: 'MDL',
          quantity: l.quantity,
        })),
      },
      payerInfo: {
        name: order.customer_name || undefined,
        email: order.customer_email || undefined,
        phone: toE164(order.customer_phone),
        ip: request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
        userAgent: request.headers.get('user-agent')?.slice(0, 500) || undefined,
      },
      language,
      callbackUrl: `${site}/api/maib/callback`,
      successUrl: returnUrl,
      failUrl: returnUrl,
    });

    const { error: insertError } = await db.from('payments').insert({
      order_id: orderId,
      provider: 'maib',
      checkout_id: checkout.checkoutId,
      checkout_url: checkout.checkoutUrl,
      amount_bani: priced.totalBani,
      currency: 'MDL',
      status: 'pending',
    });
    if (insertError) throw insertError;

    return json({ checkoutUrl: checkout.checkoutUrl });
  } catch (err) {
    console.error('maib create failed', err instanceof MaibError ? { message: err.message, body: err.body } : err);
    return json({ error: 'payment_init_failed' }, 502);
  }
}
