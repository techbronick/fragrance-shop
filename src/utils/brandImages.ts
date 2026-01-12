// src/utils/brandImages.ts
import { supabase } from "@/integrations/supabase/client";

const fallbackBrandImage = "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=400&h=400&q=75&fm=webp";

export const getBrandImageUrl = (brandName: string): string => {
  try {
    const fileName = brandName + '.webp';
    const { data } = supabase.storage
      .from('brand-images')
      .getPublicUrl(fileName);
    
    return data.publicUrl || fallbackBrandImage;
  } catch (error) {
    console.error(`Error getting brand image for ${brandName}:`, error);
    return fallbackBrandImage;
  }
};

// Cache pentru performanță
const brandImageCache = new Map<string, string>();

export const getCachedBrandImageUrl = (brandName: string): string => {
  if (brandImageCache.has(brandName)) {
    return brandImageCache.get(brandName)!;
  }
  
  const url = getBrandImageUrl(brandName);
  brandImageCache.set(brandName, url);
  return url;
};