import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch current stock values for a list of SKU ids, returned as an array of
 * numbers aligned with the sorted input ids. A SKU missing from the DB is
 * treated as 0 stock (safer — pushes aggregate to "backorder").
 *
 * The query key uses the sorted id list so callers that produce the same
 * set of ids in different orders share a cache entry.
 */
export function useSKUStocks(skuIds: string[]) {
  const sortedIds = [...skuIds].sort();

  return useQuery({
    queryKey: ['sku-stocks', sortedIds],
    queryFn: async (): Promise<number[]> => {
      if (sortedIds.length === 0) return [];

      const { data, error } = await supabase
        .from('skus')
        .select('id, stock')
        .in('id', sortedIds);

      if (error) throw error;

      const byId = new Map(
        (data ?? []).map((row) => [row.id, row.stock]),
      );
      return sortedIds.map((id) => byId.get(id) ?? 0);
    },
    enabled: sortedIds.length > 0,
  });
}
