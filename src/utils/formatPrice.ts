
export const formatPrice = (priceInBani: number): string => {
  const lei = priceInBani / 100;
  // Format with comma as decimal separator and space as thousands separator
  const formatted = lei.toLocaleString('ro-MD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace('.', ',').replace(/\s/g, ' ');

  return `${formatted} Lei`;
};

/**
 * Product/SKU price formatter. When the price is 0 (or missing), returns the
 * provided "by order" label instead of "0,00 Lei". Use only on customer-facing
 * product surfaces (catalog, PDP) — not for cart subtotals or admin totals.
 */
export const formatProductPrice = (priceInBani: number, byOrderText: string): string => {
  if (!priceInBani || priceInBani <= 0) return byOrderText;
  return formatPrice(priceInBani);
};
