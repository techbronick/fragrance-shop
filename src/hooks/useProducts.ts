
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/database";

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      let allProducts: Product[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, from + pageSize - 1);
        
        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          allProducts = [...allProducts, ...data];
          from += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }
      
      return allProducts as Product[];
    }
  });
};
/**
 * Fetches the N most recently created products. Targeted query — doesn't pull
 * the entire products table just to slice the top 8 client-side. Used on the
 * homepage's New Arrivals carousel.
 */
export const useNewestProducts = (limit = 8) => {
  return useQuery({
    queryKey: ['products', 'newest', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });
};

/**
 * Returns the list of distinct brand names from the products table. ~300 short
 * strings — much lighter than fetching the full products row to derive brand
 * names client-side. Used by the homepage BrandWall marquee.
 */
export const useBrandList = () => {
  return useQuery({
    queryKey: ['products', 'brands'],
    queryFn: async () => {
      const pageSize = 1000;
      const all: { brand: string }[] = [];
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from('products')
          .select('brand')
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return Array.from(new Set(all.map((p) => p.brand))).filter(Boolean);
    },
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Lightweight products fetch for the search overlay. Returns only fields used
 * by the search-result dropdown; runs only when `enabled` is true so the home
 * page doesn't pay the cost on initial paint.
 */
export const useSearchableProducts = (enabled: boolean) => {
  return useQuery({
    queryKey: ['products', 'searchable'],
    queryFn: async () => {
      const pageSize = 1000;
      const all: Array<Pick<Product, 'id' | 'brand' | 'name' | 'image_url'>> = [];
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from('products')
          .select('id, brand, name, image_url')
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...(data as Array<Pick<Product, 'id' | 'brand' | 'name' | 'image_url'>>));
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
      
      return data as Product;
    },
    enabled: !!id
  });
};
