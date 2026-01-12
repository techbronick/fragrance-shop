// This file is now deprecated - using real database data instead
// Keeping for reference but all functionality moved to database hooks

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  imageUrl: string;
  notesTop: string[];
  notesMid: string[];
  notesBase: string[];
  concentration: string;
  family: string;
  genderNeutral: boolean;
  launchYear: number;
  rating: number;
  reviewCount: number;
}

export interface SKU {
  id: string;
  productId: string;
  sizeML: number;
  price: number;
  stock: number;
  label: string;
}

// Legacy functions - use database hooks instead
export const formatPrice = (priceInBani: number): string => {
  const lei = priceInBani / 100;
  const formatted = lei.toLocaleString('ro-MD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace('.', ',').replace(/\s/g, ' ');
  
  return `${formatted} Lei`;
};

export const getSKUsForProduct = (productId: string): SKU[] => {
  return [];
};

export const sampleProducts: Product[] = [];
export const sampleSKUs: SKU[] = [];
