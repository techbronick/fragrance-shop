import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  DiscoverySetConfig, 
  DiscoveryRecommendation,
} from "@/types/database";

// Fetch all active discovery set configs
export const useDiscoverySetConfigs = () => {
  return useQuery({
    queryKey: ['discovery-set-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_set_configs')
        .select('*')
        .eq('is_active', true)
        .order('total_slots', { ascending: true });
      
      if (error) {
        console.error('Error fetching discovery set configs:', error);
        throw error;
      }
      
      return data as DiscoverySetConfig[];
    }
  });
};

// Create recommendation
export const useCreateRecommendation = () => {
  return useMutation({
    mutationFn: async (recommendation: Omit<DiscoveryRecommendation, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('discovery_recommendations')
        .insert(recommendation)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating recommendation:', error);
        throw error;
      }
      
      return data as DiscoveryRecommendation;
    }
  });
};
// Adaugă acest hook în useDiscoverySets.ts
export const useDiscoverySetConfigsWithItems = () => {
  return useQuery({
    queryKey: ['discovery-set-configs-with-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_set_configs')
        .select(`
          *,
          items:discovery_set_config_items(
            *,
            sku:skus(
              *,
              product:products(*)
            )
          )
        `)
        .eq('is_active', true)
        .order('total_slots', { ascending: true });
      
      if (error) {
        console.error('Error fetching discovery set configs with items:', error);
        throw error;
      }
      
      return data;
    }
  });
};