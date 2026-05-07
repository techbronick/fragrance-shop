import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SKU } from "@/types/database";

export function useAllSKUs() {
  return useQuery({
    queryKey: ['skus', 'all'],
    queryFn: async () => {
      let all: SKU[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from('skus')
          .select('*')
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (data && data.length > 0) {
          all = [...all, ...data];
          from += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }
      return all as SKU[];
    },
  });
}

export function buildMinPriceMap(skus: SKU[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const sku of skus) {
    const current = map.get(sku.product_id);
    if (current === undefined || sku.price < current) {
      map.set(sku.product_id, sku.price);
    }
  }
  return map;
}

export function buildInStockMap(skus: SKU[]): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const sku of skus) {
    if (sku.stock > 0) map.set(sku.product_id, true);
  }
  return map;
}

export function buildSkusByProductMap(skus: SKU[]): Map<string, SKU[]> {
  const map = new Map<string, SKU[]>();
  for (const sku of skus) {
    const arr = map.get(sku.product_id);
    if (arr) arr.push(sku);
    else map.set(sku.product_id, [sku]);
  }
  return map;
}
