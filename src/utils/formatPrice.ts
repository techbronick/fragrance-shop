
// Romanian/continental price format: "." for thousands, "," for decimals.
// 250000 bani -> "2.500,00 Lei". Built manually instead of toLocaleString
// because locale output is implementation-dependent (Node and various
// browsers ship subtly different group/decimal separators for ro-MD).
export const formatPrice = (priceInBani: number): string => {
  const cents = Math.round(priceInBani);
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const integerPart = Math.floor(abs / 100).toString();
  const fractionalPart = (abs % 100).toString().padStart(2, '0');
  const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}${withThousands},${fractionalPart} Lei`;
};

/**
 * Product/SKU price formatter. When the price is 0 (or missing), returns the
 * provided "by order" label instead of "0,00 Lei". Use only on customer-facing
 * product surfaces (catalog, PDP): not for cart subtotals or admin totals.
 */
export const formatProductPrice = (priceInBani: number, byOrderText: string): string => {
  if (!priceInBani || priceInBani <= 0) return byOrderText;
  return formatPrice(priceInBani);
};
