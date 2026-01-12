
export const formatPrice = (priceInBani: number): string => {
  const lei = priceInBani / 100;
  // Format with comma as decimal separator and space as thousands separator
  const formatted = lei.toLocaleString('ro-MD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace('.', ',').replace(/\s/g, ' ');
  
  return `${formatted} Lei`;
};
