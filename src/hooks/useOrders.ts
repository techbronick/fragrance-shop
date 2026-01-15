import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderWithItems, CreateOrderInput, OrderItem, ShippingAddressJson, OrderItemSnapshot } from "@/types/orders";
import { CartItem } from "./useCart";
import type { Database } from "@/integrations/supabase/types";

// Tipuri din Supabase
type DbOrder = Database['public']['Tables']['orders']['Row'];
type DbOrderItem = Database['public']['Tables']['order_items']['Row'];

// Helper function pentru a converti DbOrder în Order
// Helper function pentru a converti DbOrder în Order
const mapDbOrderToOrder = (dbOrder: DbOrder): Order => {
    return {
      ...dbOrder,
      shipping_address: dbOrder.shipping_address as unknown as ShippingAddressJson | null,
      status: dbOrder.status as Order['status']
    };
  };

// Helper function pentru a converti DbOrderItem în OrderItem
const mapDbOrderItemToOrderItem = (dbItem: DbOrderItem): OrderItem => {
    return {
      ...dbItem,
      item_type: dbItem.item_type as OrderItem['item_type'],
      snapshot: dbItem.snapshot as unknown as OrderItemSnapshot | null
    };
  };
// Fetch all orders for a user
export const useOrders = (userId?: string) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      // Map DB orders to our Order type
      return data.map(mapDbOrderToOrder);
    },
    enabled: !!userId
  });
};

// Fetch single order with items
export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      // Fetch order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;
      
      // Fetch order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      if (itemsError) throw itemsError;
      
      // Map and return
      return {
        ...mapDbOrderToOrder(order),
        items: items.map(mapDbOrderItemToOrderItem)
      } as OrderWithItems;
    },
    enabled: !!orderId
  });
};

// Create order from cart
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      input,
      cartItems,
      shippingCost
    }: {
      input: CreateOrderInput;
      cartItems: CartItem[];
      shippingCost: number;
    }) => {
      // Calculate totals
      const subtotal_bani = cartItems.reduce((sum, item) => {
        return sum + (item.price * 100 * item.quantity);
      }, 0);
      
      const total_bani = subtotal_bani + shippingCost;
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: input.user_id || null,
          status: 'pending',
          currency: 'MDL',
          customer_email: input.customer_email,
          customer_phone: input.customer_phone,
          customer_name: input.customer_name,
          shipping_address: input.shipping_address as any, // Cast to Json
          shipping_bani: shippingCost,
          subtotal_bani: subtotal_bani,
          total_bani: total_bani
        })
        .select()
        .single();
      
      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }
      
      // Create order items
      const orderItems = await Promise.all(
        cartItems.map(async (item) => {
          const unit_price_bani = item.price * 100;
          const line_total_bani = unit_price_bani * item.quantity;
          
          let itemType: 'sku' | 'predefined_bundle' | 'custom_bundle';
          let sku_id: string | null = null;
          let config_id: string | null = null;
          let snapshot: OrderItemSnapshot;
          
          if (item.type === 'product' && item.skuId) {
            // Individual SKU purchase
            itemType = 'sku';
            sku_id = item.skuId;
            snapshot = {
              product_name: item.name,
              brand: item.brand,
              image_url: item.image,
              size_ml: item.sizeLabel ? parseInt(item.sizeLabel) : undefined,
              size_label: item.sizeLabel
            };
          } else if (item.type === 'predefined-bundle') {
            // Predefined bundle (fixed items from DB)
            itemType = 'predefined_bundle';
            config_id = item.configId || null;
            
            // Fetch config + items from DB to build snapshot
            const { data: configData, error: configError } = await supabase
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
              .eq('id', item.configId)
              .single();
            
            if (configError || !configData) {
              console.error('Error fetching config for predefined bundle:', configError);
              // Fallback snapshot without DB data
              snapshot = {
                product_name: item.name,
                image_url: item.image
              };
            } else {
              snapshot = {
                // Add product_name and image_url at root level for display
                product_name: configData.name,
                image_url: configData.image_url || null,
                config: {
                  id: configData.id,
                  name: configData.name,
                  volume_ml: configData.volume_ml,
                  total_slots: configData.total_slots
                },
                items: (configData.items || [])
                  .map((configItem: any) => {
                    if (!configItem.sku) {
                      console.warn(`SKU not found for config item: ${configItem.id}`);
                      return null;
                    }
                    return {
                      slot_index: configItem.slot_index,
                      sku_id: configItem.sku_id,
                      size_ml: configItem.sku.size_ml,
                      label: configItem.sku.label,
                      product: configItem.sku.product ? {
                        id: configItem.sku.product.id,
                        brand: configItem.sku.product.brand,
                        name: configItem.sku.product.name,
                        image_url: configItem.sku.product.image_url
                      } : undefined
                    };
                  })
                  .filter(Boolean) // Remove null entries
              };
            }
          } else if (item.type === 'custom-bundle') {
            // Custom bundle (user-selected items)
            itemType = 'custom_bundle';
            config_id = item.configId || null;
            
            // Validate selectedItems exists
            if (!item.selectedItems || item.selectedItems.length === 0) {
              // If no selected items, create a basic snapshot
              const { data: configData } = await supabase
                .from('discovery_set_configs')
                .select('*')
                .eq('id', item.configId)
                .single();
              
              snapshot = {
                config: configData ? {
                  id: configData.id,
                  name: configData.name,
                  volume_ml: configData.volume_ml,
                  total_slots: configData.total_slots
                } : undefined,
                items: [],
                product_name: item.name,
                image_url: item.image
              };
            } else {
              // item.selectedItems contains the user's selections
              // Format: [{ slot_index: 0, sku_id: "uuid" }, ...]
              // NOTE: The sku_id might actually be a product_id from the builder
              
              // First, fetch the config to get volume_ml
              const { data: configData, error: configError } = await supabase
                .from('discovery_set_configs')
                .select('*')
                .eq('id', item.configId)
                .single();
              
              if (configError) {
                console.error('Error fetching config for custom bundle:', configError);
              }
              
              const volumeMl = configData?.volume_ml || 5; // Default to 5ml if not found
              
              // Try to fetch SKUs directly first (in case they're actual SKU IDs)
              const potentialSkuIds = item.selectedItems
                .map((s: any) => s.sku_id)
                .filter((id: string) => id);
              
              let skuData: any[] = [];
              
              // First attempt: try as SKU IDs
              const { data: directSkuData, error: directSkuError } = await supabase
                .from('skus')
                .select('*, product:products(*)')
                .in('id', potentialSkuIds);
              
              if (!directSkuError && directSkuData && directSkuData.length > 0) {
                // Successfully fetched as SKU IDs
                skuData = directSkuData;
              } else {
                // If that failed, they might be product IDs - look up SKUs by product_id and volume_ml
                const { data: productSkuData, error: productSkuError } = await supabase
                  .from('skus')
                  .select('*, product:products(*)')
                  .in('product_id', potentialSkuIds)
                  .eq('size_ml', volumeMl);
                
                if (!productSkuError && productSkuData) {
                  // Map product IDs to SKUs
                  skuData = item.selectedItems.map((selection: any) => {
                    const sku = productSkuData.find((s: any) => s.product_id === selection.sku_id);
                    return sku;
                  }).filter(Boolean);
                } else {
                  console.error('Error fetching SKUs for custom bundle:', productSkuError);
                }
              }
              
              // Build snapshot with items
              snapshot = {
                // Add product_name and image_url at root level for display
                product_name: configData ? configData.name : item.name,
                image_url: configData ? (configData.image_url || null) : (item.image || null),
                config: configData ? {
                  id: configData.id,
                  name: configData.name,
                  volume_ml: configData.volume_ml,
                  total_slots: configData.total_slots
                } : undefined,
                items: item.selectedItems
                  .map((selection: any) => {
                    // Find SKU by matching either:
                    // 1. Direct SKU ID match
                    // 2. Product ID match (if sku_id is actually a product_id)
                    const sku = skuData.find((s: any) => 
                      s.id === selection.sku_id || s.product_id === selection.sku_id
                    );
                    
                    if (!sku) {
                      console.warn(`SKU not found for selection:`, selection);
                      // Try to at least get product info if we have a product ID
                      if (selection.sku_id) {
                        // This is a fallback - we'll show what we can
                        return {
                          slot_index: selection.slot_index,
                          sku_id: selection.sku_id, // Might be product_id
                          size_ml: volumeMl,
                          label: `${volumeMl}ml`,
                          product: null // Will be null, but structure is preserved
                        };
                      }
                      return null;
                    }
                    
                    return {
                      slot_index: selection.slot_index,
                      sku_id: sku.id,
                      size_ml: sku.size_ml,
                      label: sku.label,
                      product: sku.product ? {
                        id: sku.product.id,
                        brand: sku.product.brand,
                        name: sku.product.name,
                        image_url: sku.product.image_url
                      } : undefined
                    };
                  })
                  .filter(Boolean), // Remove any null entries
              };
            };
          } else {
            throw new Error(`Unknown cart item type: ${item.type}`);
          }
          
          const { data, error } = await supabase
            .from('order_items')
            .insert({
              order_id: order.id,
              item_type: itemType,
              sku_id,
              config_id,
              quantity: item.quantity,
              unit_price_bani,
              line_total_bani,
              snapshot: snapshot as any
            })
            .select()
            .single();
          
          if (error) throw error;
          return mapDbOrderItemToOrderItem(data);
        })
      );
      
      return {
        ...mapDbOrderToOrder(order),
        items: orderItems
      };
    },
    onSuccess: (data) => {
      // Invalidate orders cache
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      orderId,
      status
    }: {
      orderId: string;
      status: Order['status'];
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbOrderToOrder(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
    }
  });
};