
import { useQuery } from "@tanstack/react-query";
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
