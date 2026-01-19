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


// ... existing code ...

export const useDiscoverySetConfigsWithItems = () => {
  return useQuery({
    queryKey: ['discovery-set-configs-with-items'],
    queryFn: async () => {
      // Pasul 1: Fetch configs
      const { data: configs, error: configsError } = await supabase
        .from('discovery_set_configs')
        .select('*')
        .eq('is_active', true)
        .order('total_slots', { ascending: true });
      
      if (configsError) {
        console.error('Error fetching discovery set configs:', configsError);
        throw configsError;
      }
      
      if (!configs || configs.length === 0) {
        return [];
      }
      
      // Pasul 2: Fetch items pentru fiecare config separat
      // Acest lucru evită problemele cu RLS în nested queries
      const configsWithItems = await Promise.all(
        configs.map(async (config: any) => {
          // Query separat pentru items - acest lucru funcționează mai bine cu RLS
          const { data: items, error: itemsError } = await supabase
            .from('discovery_set_config_items')
            .select(`
              *,
              sku:skus(
                *,
                product:products(*)
              )
            `)
            .eq('config_id', config.id)
            .order('slot_index', { ascending: true });
          
          if (itemsError) {
            console.error(`Error fetching items for config ${config.id}:`, itemsError);
            // Return config cu items gol în loc să aruncăm eroare
            return { ...config, items: [] };
          }
          
          return { ...config, items: items || [] };
        })
      );
      
      console.log('Fetched configs with items:', JSON.stringify(configsWithItems, null, 2));
      return configsWithItems;
    }
  });
};


