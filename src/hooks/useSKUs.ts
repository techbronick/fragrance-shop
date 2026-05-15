
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SKU } from "@/types/database";

export const useSKUs = (productId: string) => {
  return useQuery({
    queryKey: ['skus', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skus')
        .select('*')
        .eq('product_id', productId)
        .order('size_ml', { ascending: true });

      if (error) {
        console.error('Error fetching SKUs:', error);
        throw error;
      }

      return data as SKU[];
    },
    enabled: !!productId
  });
};

// Batch SKU fetch for a small set of product IDs (e.g. the 8 newest on the
// home page). Lets the caller hand a pre-built skusByProduct map down to
// child ProductCards so each card doesn't fire its own useSKUs query and
// reflow the layout as results stagger in.
export const useSKUsByProductIds = (productIds: string[]) => {
  const sortedIds = useMemo(() => [...productIds].sort(), [productIds]);
  const query = useQuery({
    queryKey: ['skus', 'byProducts', sortedIds],
    queryFn: async () => {
      if (sortedIds.length === 0) return [] as SKU[];
      const { data, error } = await supabase
        .from('skus')
        .select('*')
        .in('product_id', sortedIds)
        .order('size_ml', { ascending: true });
      if (error) throw error;
      return data as SKU[];
    },
    enabled: sortedIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
  const skusByProduct = useMemo(() => {
    const map = new Map<string, SKU[]>();
    for (const sku of query.data ?? []) {
      const arr = map.get(sku.product_id);
      if (arr) arr.push(sku);
      else map.set(sku.product_id, [sku]);
    }
    return map;
  }, [query.data]);
  return { ...query, skusByProduct };
};
