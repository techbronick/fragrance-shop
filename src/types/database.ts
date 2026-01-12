export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  image_url: string;
  notes_top: string[];
  notes_mid: string[];
  notes_base: string[];
  concentration: string;
  family: string;
  gender_neutral: boolean;
  launch_year: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface SKU {
  id: string;
  product_id: string;
  size_ml: number;
  price: number; // in bani (1/100 Lei)
  stock: number;
  label: string;
  created_at: string;
  updated_at: string;
}

export interface DiscoverySetConfig {
  id: string;
  name: string;
  description: string | null;
  total_slots: number;
  volume_ml: number;  // Changed from slots array
  base_price: number;
  image_url: string | null;
  is_active: boolean;
  is_customizable: boolean;  // Added
  created_at: string;
  updated_at: string;
}

// ✅ ADAUGĂ INTERFAȚA NOUĂ
export interface DiscoverySetConfigItem {
  id: string;
  config_id: string;
  sku_id: string;
  slot_index: number;
  quantity: number;
  created_at: string;
}



// ✅ ADAUGĂ INTERFEȚE CU RELAȚII

export interface DiscoverySetConfigWithItems extends DiscoverySetConfig {
  items: Array<DiscoverySetConfigItem & {
    sku: SKU & {
      product: Product;
    };
  }>;
}

export interface DiscoveryRecommendation {
  id: string;
  user_id: string | null;
  questionnaire_data: Record<string, any>;
  recommended_products: string[];
  created_at: string;
}

// ... restul tipurilor (Order, OrderItem etc.)
export interface Order {
  id: string;
  user_id: string | null;
  status: string;
  currency: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_name: string | null;
  shipping_address: any;
  shipping_bani: number;
  subtotal_bani: number;
  total_bani: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: string;
  sku_id: string | null;
  config_id: string | null;
  quantity: number;
  unit_price_bani: number;
  line_total_bani: number;
  snapshot: any;
  created_at: string;
}
