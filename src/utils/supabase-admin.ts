import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Note: We now use only the regular supabase client with RLS
// Service role key is no longer exposed in frontend
// All admin operations are protected by Row Level Security policies

// Database exploration utilities
// Note: Now uses RLS - only admins can access these counts
export const exploreDatabase = async () => {
  try {
    console.log('🔍 Exploring Supabase database...');

    // Get row counts for known tables
    const tableCounts: Record<string, number | string> = {};
    const knownTables = ['products', 'skus', 'discovery_set_configs', 'discovery_set_config_items', 'discovery_recommendations', 'orders', 'order_items'];
    for (const tableName of knownTables) {
      try {
        const { count } = await supabase
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
  // Note: Now uses RLS - only admins can access all products
  getAllProducts: async () => {
    let allProducts: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true; 
    const seenIds = new Set<string>();

    while (hasMore) {
      const { data, error } = await supabase
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
  // Note: Now uses RLS - only admins can create products
  createProduct: async (productData: any) => {
    console.log('🔍 Creating product with RLS...', {
      productData: { ...productData, notes_top: productData.notes_top?.length }
    });
    
    const { data, error } = await supabase
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
  // Note: Now uses RLS - only admins can update products
  updateProduct: async (productId: string, updates: any) => {
    console.log('🔍 Updating product with RLS...', {
      productId,
      updates: { ...updates, notes_top: updates.notes_top?.length }
    });
    
    const { data, error } = await supabase
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
  // Note: Now uses RLS - only admins can delete products
  deleteProduct: async (productId: string) => {
    console.log('🔍 Deleting product with RLS...', {
      productId
    });
    
    const { error } = await supabase
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
  // Note: Now uses RLS - only admins can access all SKUs
  getAllSKUs: async () => {
    let allSKUs: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    const seenIds = new Set<string>();

    while (hasMore) {
      const { data, error } = await supabase
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
  // Note: Public can read SKUs, but this is typically used by admins
  getSKUsByProductIds: async (productIds: string[]) => {
    if (!productIds || productIds.length === 0) {
      return { data: [], error: null };
    }

    try {
      // Supabase supports filtering by array using .in()
      const { data, error } = await supabase
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
  // Note: Now uses RLS - only admins can create SKUs
  createSKU: async (skuData: any) => {
    const { data, error } = await supabase
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
  // Note: Now uses RLS - only admins can update SKUs
  updateSKU: async (skuId: string, updates: any) => {
    const { data, error } = await supabase
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
  // Note: Now uses RLS - only admins can delete SKUs
  deleteSKU: async (skuId: string) => {
    const { error } = await supabase
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
// Note: All operations now use RLS - only admins can manage discovery sets
export const discoverySetUtils = {
  // Get all discovery set configs
  // Note: Admins see all, public sees only active ones
  getConfigs: async () => {
    const { data, error } = await supabase
      .from('discovery_set_configs')
      .select('*')
      .order('total_slots', { ascending: true });

    return { data, error };
  },

  // Create discovery set config
  createConfig: async (configData: any) => {
    const { data, error } = await supabase
      .from('discovery_set_configs')
      .insert(configData)
      .select()
      .single();

    return { data, error };
  },

  // Update discovery set config
  updateConfig: async (configId: string, updates: any) => {
    const { data, error } = await supabase
      .from('discovery_set_configs')
      .update(updates)
      .eq('id', configId)
      .select()
      .single();

    return { data, error };
  },

  // Get config items
  getConfigItems: async (configId: string) => {
    const { data, error } = await supabase
      .from('discovery_set_config_items')
      .select('*, sku:skus(*, product:products(*))')
      .eq('config_id', configId)
      .order('slot_index', { ascending: true });

    return { data, error };
  },

  // Add config item
  addConfigItem: async (itemData: { config_id: string; sku_id: string; slot_index: number; quantity?: number }) => {
    const { data, error } = await supabase
      .from('discovery_set_config_items')
      .insert({ ...itemData, quantity: itemData.quantity || 1 })
      .select()
      .single();

    return { data, error };
  },

  // Remove config item
  removeConfigItem: async (itemId: string) => {
    const { error } = await supabase
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
    const { error } = await supabase
      .from('discovery_set_configs')
      .delete()
      .eq('id', configId);

    return { error };
  }

};


// Database statistics
// Note: Now uses RLS - only admins can access these stats
export const getStats = async () => {
  try {
    const [products, skus, configs, configItems, recommendations, orders] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('skus').select('*', { count: 'exact', head: true }),
      supabase.from('discovery_set_configs').select('*', { count: 'exact', head: true }),
      supabase.from('discovery_set_config_items').select('*', { count: 'exact', head: true }),
      supabase.from('discovery_recommendations').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true })
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
// Note: Now uses RLS - only admins can access order stats
export const getOrderStats = async () => {
  try {
    // Get all orders with their status and totals
    const { data: orders, error } = await supabase
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

// Test connection
// Note: Now uses RLS - tests if admin can access admin operations
export const testConnections = async () => {
  console.log('🧪 Testing Supabase connection with RLS...');

  try {
    // Test read access (should work for admins)
    const { data: readTest, error: readError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    // Test admin operations (should work only for admins)
    const { data: adminTest, error: adminError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const stats = await getStats();

    console.log('✅ Connection test results:');
    console.log('- Read access:', readError ? '❌ Failed' : '✅ Success');
    console.log('- Admin access:', adminError ? '❌ Failed (not admin or RLS issue)' : '✅ Success');
    console.log('- Database stats:', stats);

    return {
      anonSuccess: !readError,
      adminSuccess: !adminError,
      stats,
      errors: {
        anon: readError?.message,
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