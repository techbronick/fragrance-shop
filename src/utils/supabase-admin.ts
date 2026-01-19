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
  // Get all products with detailed info (deduplicated by ID)
  getAllProducts: async () => {
    let allProducts: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true; 
    const seenIds = new Set<string>();

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
        // Deduplicate during pagination to prevent duplicates
        const uniqueData = data.filter((p: any) => {
          if (p?.id && !seenIds.has(p.id)) {
            seenIds.add(p.id);
            return true;
          }
          return false;
        });
        allProducts = [...allProducts, ...uniqueData];
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }
    
    return { data: allProducts, error: null };
  },

// ... existing code ...

  // Create a new product
  createProduct: async (productData: any) => {
    console.log('🔍 Creating product with supabaseAdmin...', {
      hasServiceRoleKey: !!getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY'),
      productData: { ...productData, notes_top: productData.notes_top?.length }
    });
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('❌ Create Product Error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('✅ Product created successfully:', data);
    }

    return { data, error };
  },

  // Update an existing product
  updateProduct: async (productId: string, updates: any) => {
    console.log('🔍 Updating product with supabaseAdmin...', {
      productId,
      hasServiceRoleKey: !!getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY'),
      updates: { ...updates, notes_top: updates.notes_top?.length }
    });
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('❌ Update Product Error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('✅ Product updated successfully:', data);
    }

    return { data, error };
  },

  // Delete a product
  deleteProduct: async (productId: string) => {
    console.log('🔍 Deleting product with supabaseAdmin...', {
      productId,
      hasServiceRoleKey: !!getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY')
    });
    
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('❌ Delete Product Error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('✅ Product deleted successfully');
    }

    return { error };
  }

};

// SKU management utilities
export const skuUtils = {
  // Get all SKUs with pagination to fetch all records (deduplicated by ID)
  getAllSKUs: async () => {
    let allSKUs: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    const seenIds = new Set<string>();

    while (hasMore) {
      const { data, error } = await supabaseAdmin
        .from('skus')
        .select('*, products(name, brand)')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);
      
      if (error) {
        console.error('❌ Error fetching SKUs:', error);
        return { data: null, error };
      }
      
      if (data && data.length > 0) {
        // Deduplicate during pagination to prevent duplicates
        const uniqueData = data.filter((sku: any) => {
          if (sku?.id && !seenIds.has(sku.id)) {
            seenIds.add(sku.id);
            return true;
          }
          return false;
        });
        allSKUs = [...allSKUs, ...uniqueData];
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }
    
    console.log(`✅ Fetched ${allSKUs.length} total SKUs from database`);
    return { data: allSKUs, error: null };
  },

  // Get SKUs for specific product IDs (optimized for pagination)
  getSKUsByProductIds: async (productIds: string[]) => {
    if (!productIds || productIds.length === 0) {
      return { data: [], error: null };
    }

    try {
      // Supabase supports filtering by array using .in()
      const { data, error } = await supabaseAdmin
        .from('skus')
        .select('*, products(name, brand)')
        .in('product_id', productIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching SKUs by product IDs:', error);
        return { data: null, error };
      }

      // Filter out any null/undefined entries and deduplicate
      const validData = (data || []).filter(sku => sku && sku.id && sku.product_id);
      const seenIds = new Set<string>();
      const uniqueSKUs = validData.filter(sku => {
        if (seenIds.has(sku.id)) {
          return false;
        }
        seenIds.add(sku.id);
        return true;
      });

      console.log(`✅ Fetched ${uniqueSKUs.length} SKUs for ${productIds.length} products`);
      return { data: uniqueSKUs, error: null };
    } catch (error) {
      console.error('❌ Failed to fetch SKUs by product IDs:', error);
      return { data: null, error: error as any };
    }
  },

  // Create a new SKU
  createSKU: async (skuData: any) => {
    const { data, error } = await supabaseAdmin
      .from('skus')
      .insert(skuData)
      .select()
      .single();

    if (error) {
      console.error('❌ Create SKU Error:', error);
    } else {
      console.log('✅ SKU created successfully:', data);
    }

    return { data, error };
  },

  // Update an existing SKU
  updateSKU: async (skuId: string, updates: any) => {
    const { data, error } = await supabaseAdmin
      .from('skus')
      .update(updates)
      .eq('id', skuId)
      .select()
      .single();

    if (error) {
      console.error('❌ Update SKU Error:', error);
    } else {
      console.log('✅ SKU updated successfully:', data);
    }

    return { data, error };
  },

  // Delete a SKU
  deleteSKU: async (skuId: string) => {
    const { error } = await supabaseAdmin
      .from('skus')
      .delete()
      .eq('id', skuId);

    if (error) {
      console.error('❌ Delete SKU Error:', error);
    } else {
      console.log('✅ SKU deleted successfully');
    }

    return { error };
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

// Get order statistics
export const getOrderStats = async () => {
  try {
    // Get all orders with their status and totals
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('status, total_bani, created_at');

    if (error) throw error;

    const totalOrders = orders?.length || 0;
    
    // Calculate totals by status
    const statusCounts = orders?.reduce((acc: Record<string, number>, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Calculate total revenue (sum of all order totals)
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_bani || 0), 0) || 0;

    // Calculate revenue for paid/shipped/delivered orders only
    const completedRevenue = orders
      ?.filter(order => ['paid', 'shipped', 'delivered'].includes(order.status))
      .reduce((sum, order) => sum + (order.total_bani || 0), 0) || 0;

    // Get today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Count orders today
    const ordersToday = orders?.filter(order => 
      new Date(order.created_at) >= today
    ).length || 0;

    // Calculate this month's revenue
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRevenue = orders
      ?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= firstDayOfMonth && 
               ['paid', 'shipped', 'delivered'].includes(order.status);
      })
      .reduce((sum, order) => sum + (order.total_bani || 0), 0) || 0;

    return {
      totalOrders,
      totalRevenue,
      completedRevenue,
      ordersToday,
      monthRevenue,
      statusCounts: {
        draft: statusCounts.draft || 0,
        placed: statusCounts.placed || 0,
        paid: statusCounts.paid || 0,
        shipped: statusCounts.shipped || 0,
        delivered: statusCounts.delivered || 0,
        canceled: (statusCounts.canceled || 0) + (statusCounts.cancelled || 0),
        refunded: statusCounts.refunded || 0
      }
    };
  } catch (error) {
    console.error('Error getting order stats:', error);
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