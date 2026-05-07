/**
 * Format price for checkout display
 * @param priceInBani - Price in bani (1/100 Lei)
 * @returns Formatted price string (ex: "50,00 L")
 */
export const formatCheckoutPrice = (priceInBani: number): string => {
    const lei = priceInBani / 100;
    
    // Format with comma as decimal separator and 2 decimals
    const formatted = lei.toFixed(2).replace('.', ',');
    
    return `${formatted} L`;
  };
  
  /**
   * Format large total with MDL currency
   * @param priceInBani - Price in bani
   * @returns Formatted string (ex: "MDL 506,00 L")
   */
  export const formatCheckoutTotal = (priceInBani: number): string => {
    const formatted = formatCheckoutPrice(priceInBani);
    return `MDL ${formatted}`;
  };