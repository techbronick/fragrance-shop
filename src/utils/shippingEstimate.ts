// Pure shipping-estimate logic. All copy lives here so sub-project A (i18n)
// has a single swap point.

export const IN_STOCK_DAYS = { minDays: 1, maxDays: 3 } as const;
export const BACKORDER_DAYS = { minDays: 7, maxDays: 14 } as const;

export const SHIPPING_COPY = {
  inStock: 'În stoc',
  backorder: 'La comandă',
  daysUnit: 'zile',
  prefix: '🚚',
} as const;

export type ShippingEstimate =
  | { type: 'in_stock'; minDays: number; maxDays: number }
  | { type: 'backorder'; minDays: number; maxDays: number };

/**
 * Aggregate shipping estimate for a list of SKU stock values.
 *
 * - [] → null (caller renders nothing)
 * - any stock <= 0 → 'backorder' (slowest wins)
 * - all stocks > 0 → 'in_stock'
 */
export function getShippingEstimate(
  stocks: number[],
): ShippingEstimate | null {
  if (stocks.length === 0) return null;
  const anyOutOfStock = stocks.some((s) => s <= 0);
  return anyOutOfStock
    ? { type: 'backorder', ...BACKORDER_DAYS }
    : { type: 'in_stock', ...IN_STOCK_DAYS };
}
