import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SKU } from "@/types/database";

// Columns sufficient to compute price/stock/size aggregates and to identify
// SKUs by id+product. We deliberately avoid `select('*')` here: the full row
// is ~5x larger and the catalog has 14k+ rows, which dominates page load on
// shop/brand views.
const ALL_SKU_COLUMNS = "id, product_id, price, stock, size_ml, label";

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
          .select(ALL_SKU_COLUMNS)
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (data && data.length > 0) {
          all = [...all, ...(data as unknown as SKU[])];
          from += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }
      return all;
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

// A product is "in stock" for the purpose of the user-facing filter only
// if it has at least one SKU with BOTH stock > 0 AND price > 0. Products
// marked stock=1 but price=0 render as "La comandă" — they're not actually
// buyable on the spot, so they don't satisfy "doar produse în stoc".
export function buildInStockMap(skus: SKU[]): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const sku of skus) {
    if (sku.stock > 0 && sku.price > 0) map.set(sku.product_id, true);
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
