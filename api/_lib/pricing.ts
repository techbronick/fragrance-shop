// Server-side re-pricing of an order. order_items are inserted by the browser
// with client-supplied prices, so the amount we charge must come from the
// catalogue, never from the stored line prices.
import type { SupabaseClient } from '@supabase/supabase-js';
import { calculateVatBani } from '../../src/utils/vat';

export interface PricedOrder {
  subtotalBani: number;
  vatBani: number;
  totalBani: number;
  lines: Array<{ id: string; title: string; unitBani: number; quantity: number }>;
}

// Mirrors the cart: prices are stored in bani and rounded to whole lei when added.
const toCartBani = (bani: number) => Math.round(bani / 100) * 100;

interface OrderItemRow {
  id: string;
  item_type: string;
  sku_id: string | null;
  config_id: string | null;
  quantity: number;
  snapshot: { product_name?: string; brand?: string; size_label?: string } | null;
}

export async function priceOrder(
  db: SupabaseClient,
  orderId: string,
  country: string,
): Promise<PricedOrder> {
  const { data: items, error } = await db
    .from('order_items')
    .select('id, item_type, sku_id, config_id, quantity, snapshot')
    .eq('order_id', orderId);
  if (error) throw error;
  if (!items?.length) throw new Error('Order has no items');

  const rows = items as OrderItemRow[];
  const skuIds = rows.filter((r) => r.item_type === 'sku' && r.sku_id).map((r) => r.sku_id!);
  const configIds = rows.filter((r) => r.item_type !== 'sku' && r.config_id).map((r) => r.config_id!);

  const [skus, configs] = await Promise.all([
    skuIds.length
      ? db.from('skus').select('id, price').in('id', skuIds)
      : Promise.resolve({ data: [], error: null }),
    configIds.length
      ? db.from('discovery_set_configs').select('id, base_price, name').in('id', configIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (skus.error) throw skus.error;
  if (configs.error) throw configs.error;

  const skuPrice = new Map((skus.data as Array<{ id: string; price: number }>).map((s) => [s.id, s.price]));
  const configPrice = new Map(
    (configs.data as Array<{ id: string; base_price: number; name: string }>).map((c) => [c.id, c]),
  );

  const lines = rows.map((row) => {
    if (!Number.isInteger(row.quantity) || row.quantity < 1) {
      throw new Error(`Invalid quantity on order item ${row.id}`);
    }
    let unit: number | undefined;
    let title = row.snapshot?.product_name || 'Produs';
    if (row.item_type === 'sku') {
      unit = row.sku_id ? skuPrice.get(row.sku_id) : undefined;
      const extra = [row.snapshot?.brand, row.snapshot?.size_label].filter(Boolean).join(' ');
      if (extra) title = `${extra} ${title}`.trim();
    } else {
      const config = row.config_id ? configPrice.get(row.config_id) : undefined;
      unit = config?.base_price;
      if (config?.name) title = config.name;
    }
    if (!unit || unit <= 0) throw new Error(`No catalogue price for order item ${row.id}`);
    return { id: row.id, title: title.slice(0, 125), unitBani: toCartBani(unit), quantity: row.quantity };
  });

  const subtotalBani = lines.reduce((sum, l) => sum + l.unitBani * l.quantity, 0);
  const vatBani = calculateVatBani(subtotalBani, country);
  return { subtotalBani, vatBani, totalBani: subtotalBani + vatBani, lines };
}
