export interface Order {
    id: string;
    user_id: string | null;
    status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    currency: string;
    customer_email: string | null;
    customer_phone: string | null;
    customer_name: string | null;
    shipping_address: ShippingAddressJson | null;
    shipping_bani: number;
    subtotal_bani: number;
    total_bani: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface ShippingAddressJson {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode?: string;
    country: string;
    phone: string;
  }
  
  export interface OrderItem {
    id: string;
    order_id: string;
    item_type: 'sku' | 'predefined_bundle' | 'custom_bundle'; 
    sku_id: string | null;
    config_id: string | null;
    quantity: number;
    unit_price_bani: number;
    line_total_bani: number;
    snapshot: OrderItemSnapshot | null;
    created_at: string;
  }
  
  export interface OrderItemSnapshot {
    // For SKU items
    product_name?: string;
    brand?: string;
    size_ml?: number;
    size_label?: string;
    image_url?: string;
    
    // For bundle items (predefined or custom)
    config?: {
      id: string;
      name: string;
      volume_ml: number;
      total_slots: number;
    };
    items?: Array<{
      slot_index: number;
      sku_id: string;
      size_ml: number;
      label: string;
      product: {
        id: string;
        brand: string;
        name: string;
        image_url: string;
      };
    }>;
  }
  
  export interface OrderWithItems extends Order {
    items: OrderItem[];
  }
  
  export interface CreateOrderInput {
    user_id?: string;
    customer_email: string;
    customer_phone: string;
    customer_name: string;
    shipping_address: ShippingAddressJson;
    shipping_method_id: string;
    newsletter_opt_in?: boolean;
  }