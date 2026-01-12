export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      discovery_recommendations: {
        Row: {
          created_at: string
          id: string
          questionnaire_data: JSON
          recommended_products: JSON
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          questionnaire_data: JSON
          recommended_products: JSON
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          questionnaire_data?: JSON
          recommended_products?: JSON
          user_id?: string | null
        }
        Relationships: []
      }
      discovery_set_config_items: {
        Row: {
          config_id: string
          created_at: string
          id: string
          quantity: number
          sku_id: string
          slot_index: number
        }
        Insert: {
          config_id: string
          created_at?: string
          id?: string
          quantity?: number
          sku_id: string
          slot_index: number
        }
        Update: {
          config_id?: string
          created_at?: string
          id?: string
          quantity?: number
          sku_id?: string
          slot_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "discovery_set_config_items_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "discovery_set_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_set_config_items_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_set_configs: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_customizable: boolean
          name: string
          total_slots: number
          updated_at: string
          volume_ml: number
        }
        Insert: {
          base_price: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_customizable?: boolean
          name: string
          total_slots: number
          updated_at?: string
          volume_ml: number
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_customizable?: boolean
          name?: string
          total_slots?: number
          updated_at?: string
          volume_ml?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          config_id: string | null
          created_at: string
          id: string
          item_type: string
          line_total_bani: number
          order_id: string
          quantity: number
          sku_id: string | null
          snapshot: JSON | null
          unit_price_bani: number
        }
        Insert: {
          config_id?: string | null
          created_at?: string
          id?: string
          item_type: string
          line_total_bani?: number
          order_id: string
          quantity?: number
          sku_id?: string | null
          snapshot?: JSON | null
          unit_price_bani?: number
        }
        Update: {
          config_id?: string | null
          created_at?: string
          id?: string
          item_type?: string
          line_total_bani?: number
          order_id?: string
          quantity?: number
          sku_id?: string | null
          snapshot?: JSON | null
          unit_price_bani?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "discovery_set_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          shipping_address: JSON | null
          shipping_bani: number
          status: string
          subtotal_bani: number
          total_bani: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          shipping_address?: JSON | null
          shipping_bani?: number
          status?: string
          subtotal_bani?: number
          total_bani?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          shipping_address?: JSON | null
          shipping_bani?: number
          status?: string
          subtotal_bani?: number
          total_bani?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string
          concentration: string
          created_at: string
          description: string
          family: string
          gender_neutral: boolean
          id: string
          image_url: string
          launch_year: number
          name: string
          notes_base: string[]
          notes_mid: string[]
          notes_top: string[]
          rating: number
          review_count: number
          updated_at: string
        }
        Insert: {
          brand: string
          concentration: string
          created_at?: string
          description: string
          family: string
          gender_neutral?: boolean
          id?: string
          image_url: string
          launch_year: number
          name: string
          notes_base?: string[]
          notes_mid?: string[]
          notes_top?: string[]
          rating?: number
          review_count?: number
          updated_at?: string
        }
        Update: {
          brand?: string
          concentration?: string
          created_at?: string
          description?: string
          family?: string
          gender_neutral?: boolean
          id?: string
          image_url?: string
          launch_year?: number
          name?: string
          notes_base?: string[]
          notes_mid?: string[]
          notes_top?: string[]
          rating?: number
          review_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      search_events: {
        Row: {
          created_at: string
          filters: JSON | null
          id: string
          query: string
          results_count: number
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          filters?: JSON | null
          id?: string
          query: string
          results_count?: number
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          filters?: JSON | null
          id?: string
          query?: string
          results_count?: number
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      skus: {
        Row: {
          created_at: string
          id: string
          label: string
          price: number
          product_id: string
          size_ml: number
          stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          price: number
          product_id: string
          size_ml: number
          stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          price?: number
          product_id?: string
          size_ml?: number
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skus_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
