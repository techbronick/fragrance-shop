import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

function getEnv(key: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key];
  }
  return undefined;
}

// Regular client for frontend operations
export const supabase = createClient<Database>(
  getEnv('VITE_SUPABASE_URL')!,
  getEnv('VITE_SUPABASE_ANON_KEY')!
);

// Admin client with service role key (bypasses RLS - use carefully!)
export const supabaseAdmin = createClient<Database>(
  getEnv('VITE_SUPABASE_URL')!,
  getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY')!
);

// Database exploration utilities
export const exploreDatabase = async () => {
  try {
    console.log('🔍 Exploring Supabase database...');

    // Get row counts for known tables
    const tableCounts = {};
    const knownTables = ['products', 'skus', 'discovery_set_configs', 'discovery_set_config_items', 'discovery_recommendations', 'orders', 'order_items'];
    for (const tableName of knownTables) {
      try {
        const { count } = await supabaseAdmin
          .from(tableName as any)
          .select('*', { count: 'exact', head: true });

        tableCounts[tableName] = count || 0;
      } catch (error) {
        console.warn(`Could not get count for table ${tableName}:`, error);
        tableCounts[tableName] = 'Error';
      }
    }

    console.log('📈 Table row counts:', tableCounts);

    return {
      success: true,
      tables: knownTables,
      counts: tableCounts
    };

  } catch (error) {
    console.error('❌ Database exploration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Product management utilities
export const productUtils = {
  // Get all products with detailed info
  getAllProducts: async () => {
    let allProducts: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true; 

    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);
      
      if (error) {
        console.error('Error fetching products:', error);
        return { data: null, error };
      }
      
      if (data && data.length > 0) {
        allProducts = [...allProducts, ...data];
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }
    
    return { data: allProducts, error: null };
  },

  // Create a new product
  createProduct: async (productData: any) => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single();

    return { data, error };
  },

  // Update an existing product
  updateProduct: async (productId: string, updates: any) => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    return { data, error };
  },

  // Delete a product
  deleteProduct: async (productId: string) => {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    return { error };
  }

};

// SKU management utilities
export const skuUtils = {
  // Get all SKUs with pagination to fetch all records
  getAllSKUs: async () => {
    let allSKUs: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from('skus')
        .select('*, products(name, brand)')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);
      
      if (error) {
        console.error('Error fetching SKUs:', error);
        return { data: null, error };
      }
      
      if (data && data.length > 0) {
        allSKUs = [...allSKUs, ...data];
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }
    
    return { data: allSKUs, error: null };
  },

};

// Discovery Set utilities
export const discoverySetUtils = {
  // Get all discovery set configs
  getConfigs: async () => {
    const { data, error } = await supabaseAdmin
      .from('discovery_set_configs')
      .select('*')
      .order('total_slots', { ascending: true });

    return { data, error };
  },


  // Create discovery set config
  createConfig: async (configData: any) => {
    const { data, error } = await supabaseAdmin
      .from('discovery_set_configs')
      .insert(configData)
      .select()
      .single();

    return { data, error };
  },


  // In discoverySetUtils object, add:
  updateConfig: async (configId: string, updates: any) => {
    const { data, error } = await supabaseAdmin
      .from('discovery_set_configs')
      .update(updates)
      .eq('id', configId)
      .select()
      .single();

    return { data, error };
  },

  // Also add config items management:
  getConfigItems: async (configId: string) => {
    const { data, error } = await supabaseAdmin
      .from('discovery_set_config_items')
      .select('*, sku:skus(*, product:products(*))')
      .eq('config_id', configId)
      .order('slot_index', { ascending: true });

    return { data, error };
  },

  addConfigItem: async (itemData: { config_id: string; sku_id: string; slot_index: number; quantity?: number }) => {
    const { data, error } = await supabaseAdmin
      .from('discovery_set_config_items')
      .insert({ ...itemData, quantity: itemData.quantity || 1 })
      .select()
      .single();

    return { data, error };
  },

  removeConfigItem: async (itemId: string) => {
    const { error } = await supabaseAdmin
      .from('discovery_set_config_items')
      .delete()
      .eq('id', itemId);

    return { error };
  },

  // Delete discovery set config
  deleteConfig: async (configId: string) => {
    // First delete all config items
    const { data: items } = await discoverySetUtils.getConfigItems(configId);
    if (items) {
      for (const item of items) {
        await discoverySetUtils.removeConfigItem(item.id);
      }
    }
    
    // Then delete the config
    const { error } = await supabaseAdmin
      .from('discovery_set_configs')
      .delete()
      .eq('id', configId);

    return { error };
  }

};


// Database statistics
export const getStats = async () => {
  try {
    const [products, skus, configs, configItems, recommendations, orders] = await Promise.all([
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('skus').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('discovery_set_configs').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('discovery_set_config_items').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('discovery_recommendations').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true })
    ]);

    return {
      products: products.count || 0,
      skus: skus.count || 0,
      discoveryConfigs: configs.count || 0,
      discoveryConfigItems: configItems.count || 0,
      recommendations: recommendations.count || 0,
      orders: orders.count || 0
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return null;
  }
};

// Test connection with both clients
export const testConnections = async () => {
  console.log('🧪 Testing Supabase connections...');

  try {
    // Test anon client
    const { data: anonTest, error: anonError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    // Test admin client
    const { data: adminTest, error: adminError } = await supabaseAdmin
      .from('products')
      .select('count')
      .limit(1);

    const stats = await getStats();

    console.log('✅ Connection test results:');
    console.log('- Anon client:', anonError ? '❌ Failed' : '✅ Success');
    console.log('- Admin client:', adminError ? '❌ Failed' : '✅ Success');
    console.log('- Database stats:', stats);

    return {
      anonSuccess: !anonError,
      adminSuccess: !adminError,
      stats,
      errors: {
        anon: anonError?.message,
        admin: adminError?.message
      }
    };

  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return {
      anonSuccess: false,
      adminSuccess: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 