import { useState, useEffect } from "react";
import { Package, Palette, Moon } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { DiscoverySetConfig, Product } from "@/types/database";
import { useButtonAnimation } from "@/hooks/useButtonAnimation";
import { useToast } from "@/hooks/use-toast";
import { DiscoveryConfigSelector } from "./DiscoveryConfigSelector";
import { DiscoverySetNameEditor } from "./DiscoverySetNameEditor";
import { DiscoverySlotsManager } from "./DiscoverySlotsManager";
import { DiscoveryProductSelector } from "./DiscoveryProductSelector";
import { DiscoverySetActions } from "./DiscoverySetActions";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/utils/formatPrice";
import { supabase } from "@/utils/supabase-admin";

interface PredefinedSet {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  image: string;
  price: number;
  samples: number;
  configuration: string;
  fragrances: string[];
  isCustomizable?: boolean;
}

interface DiscoverySetBuilderProps {
  configs: DiscoverySetConfig[];
  selectedConfigId: string | null;
  selectedPredefinedSet: PredefinedSet | null;
  onConfigSelect: (configId: string) => void;
  onPredefinedSetSelect: (set: PredefinedSet | null) => void;
}

export const DiscoverySetBuilder = ({ 
  configs, 
  selectedConfigId, 
  selectedPredefinedSet, 
  onConfigSelect, 
  onPredefinedSetSelect 
}: DiscoverySetBuilderProps) => {
  const { data: products } = useProducts();
  const { isAnimating, triggerAnimation } = useButtonAnimation();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [selectedProducts, setSelectedProducts] = useState<Array<{ product: Product; slotIndex: number }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [familyFilter, setFamilyFilter] = useState<string>("all");
  const [setName, setSetName] = useState("");

  const selectedConfig = configs.find(c => c.id === selectedConfigId);
  
  // Create a mock config from predefined set if selected
  const mockConfigFromPredefined = selectedPredefinedSet ? {
    id: selectedPredefinedSet.id,
    name: selectedPredefinedSet.name,
    description: selectedPredefinedSet.description,
    base_price: selectedPredefinedSet.price,
    total_slots: selectedPredefinedSet.samples,
    volume_ml: parseInt(selectedPredefinedSet.configuration.split('×')[1]) || 1,  // Extract from "3×5ml" -> 5
    image_url: selectedPredefinedSet.image,
    is_active: true,
    is_customizable: true,
    created_at: "",
    updated_at: ""
  } : null;

  const activeConfig = selectedConfig || mockConfigFromPredefined;
  
  useEffect(() => {
    if (activeConfig) {
      setSelectedProducts([]);
      setSetName(`${activeConfig.name} Personalizat`);
    }
  }, [selectedConfigId, selectedPredefinedSet]);

  if (!activeConfig) {
    // Available customizable configurations
    const customizableConfigs = [
      {
        id: "trixter",
        name: "Trixter",
        description: "Set special cu parfumuri surprinzătoare și unice",
        icon: Palette,
        image: "/Discoverybox2.png",
        price: 18000, // 180 Lei for 3x2ml
        samples: 3,
        configuration: "3×2ml",
        fragrances: [],
        isCustomizable: true
      },
      {
        id: "premium",
        name: "Premium",
        description: "Combinație ideală pentru testare aprofundată",
        icon: Palette,
        image: "/Discoverybox3.png",
        price: 37500, // 375 Lei for 3x5ml
        samples: 3,
        configuration: "3×5ml",
        fragrances: [],
        isCustomizable: true
      },
      {
        id: "intensiv-custom",
        name: "Intensiv Custom",
        description: "Alege-ți propriile parfumuri intense",
        icon: Moon,
        image: "/Discoverybox4.png",
        price: 75000, // 750 Lei for 3x10ml
        samples: 3,
        configuration: "3×10ml",
        fragrances: [],
        isCustomizable: true
      }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-2xl font-playfair font-semibold mb-2">Alege Configurația Setului</h3>
          <p className="text-muted-foreground">
            Selectează tipul de set pe care vrei să-l personalizezi cu propriile parfumuri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customizableConfigs.map((config) => {
            const IconComponent = config.icon;
            return (
              <Card 
                key={config.id} 
                className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => onPredefinedSetSelect(config)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square rounded-lg overflow-hidden mb-4">
                    <img 
                      src={config.image} 
                      alt={config.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-playfair font-medium group-hover:text-primary transition-colors">
                        {config.name}
                      </h3>
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {config.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {config.configuration}
                      </Badge>
                      <span className="text-lg font-semibold text-primary">
                        {formatPrice(config.price)}
                      </span>
                    </div>
                    <div className="pt-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-0 group-hover:w-full transition-all duration-500"></div>
                      </div>
                      <p className="text-xs text-center mt-2 text-muted-foreground group-hover:text-primary transition-colors">
                        Click pentru a personaliza
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Sfat:</strong> Fiecare configurație îți permite să alegi propriile parfumuri pentru testare
          </p>
        </div>
      </div>
    );
  }

  const addProductToSlot = (product: Product, slotIndex: number) => {
    console.log('DiscoverySetBuilder addProductToSlot called:', product.name, 'slot:', slotIndex);
    setSelectedProducts(prev => {
      console.log('Current selectedProducts:', prev);
      // Remove any existing product from this slot
      const filtered = prev.filter(p => p.slotIndex !== slotIndex);
      // Add the new product to this slot
      const newProducts = [...filtered, { product, slotIndex }];
      console.log('New selectedProducts:', newProducts);
      return newProducts;
    });
  };

  const removeProductFromSlot = (slotIndex: number) => {
    setSelectedProducts(prev => prev.filter(p => p.slotIndex !== slotIndex));
  };

  const isSetComplete = () => {
    return selectedProducts.length === activeConfig.total_slots;
  };

  const calculateTotalPrice = () => {
    return activeConfig.base_price;
  };



  const handleAddToCart = () => {
    if (!isSetComplete()) {
      toast({
        title: "Set incomplet",
        description: "Te rugăm să completezi toate sloturile înainte de a adăuga în coș.",
        variant: "destructive"
      });
      return;
    }
    // Map selectedProducts to the format needed for cart
    const selectedItems = selectedProducts.map(sp => ({
      slot_index: sp.slotIndex,
      sku_id: sp.product.id  // Note: This should be the SKU ID, not product ID
    }));

    // Add custom bundle to cart (CLIENT-SIDE ONLY - no DB write)
    addItem({
      id: crypto.randomUUID(),  // Temporary client ID
      type: 'custom-bundle',
      configId: activeConfig.id,
      selectedItems: selectedItems,
      name: setName || activeConfig.name,
      quantity: 1,
      price: Math.round(calculateTotalPrice() / 100),
      sizeLabel: `${activeConfig.total_slots} mostre`,
      image: selectedProducts[0]?.product.image_url || activeConfig.image_url
    });

    triggerAnimation();
    
    toast({
      title: "Adăugat în coș!",
      description: `${setName || activeConfig.name} a fost adăugat în coș.`
    });

    // Reset builder
    setSelectedProducts([]);
  
  
};

  return (
    <div className="space-y-6">
      <DiscoveryConfigSelector 
        selectedConfig={activeConfig}
        onConfigChange={() => {
          onConfigSelect("");
          onPredefinedSetSelect(null);
        }}
      />

      <DiscoverySlotsManager 
        selectedConfig={activeConfig}
        selectedProducts={selectedProducts}
        onRemoveProduct={removeProductFromSlot}
      />

      <DiscoveryProductSelector 
        products={products || []}
        selectedConfig={activeConfig}
        selectedProducts={selectedProducts}
        searchTerm={searchTerm}
        brandFilter={brandFilter}
        familyFilter={familyFilter}
        onSearchChange={setSearchTerm}
        onBrandFilterChange={setBrandFilter}
        onFamilyFilterChange={setFamilyFilter}
        onAddProduct={addProductToSlot}
      />

      <DiscoverySetActions 
        totalPrice={calculateTotalPrice()}
        selectedCount={selectedProducts.length}
        totalSlots={activeConfig.total_slots}
        isSetComplete={isSetComplete()}
        isAnimating={isAnimating}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};
