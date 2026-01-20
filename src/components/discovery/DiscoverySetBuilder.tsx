import { useState, useEffect } from "react";
import { Package, Palette, Clock, Sparkles, ShoppingCart, Check, Droplets, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { DiscoverySetConfig, Product } from "@/types/database";
import { useButtonAnimation } from "@/hooks/useButtonAnimation";
import { useToast } from "@/hooks/use-toast";
import { DiscoveryConfigSelector } from "./DiscoveryConfigSelector";
import { DiscoveryProductSelector } from "./DiscoveryProductSelector";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/formatPrice";

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
  // Generate a cross-browser-safe unique ID for custom bundles
  const generateBundleId = () => {
    // Prefer secure randomUUID where available (modern browsers)
    if (typeof window !== "undefined" && window.crypto && "randomUUID" in window.crypto) {
      return window.crypto.randomUUID();
    }
    // Fallback for older/mobile browsers
    return `bundle_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  };

  const { data: products } = useProducts();
  const { isAnimating, triggerAnimation } = useButtonAnimation();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [selectedProducts, setSelectedProducts] = useState<Array<{ product: Product; slotIndex: number }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [familyFilter, setFamilyFilter] = useState<string>("all");
  const [imageError, setImageError] = useState(false);

  const selectedConfig = configs.find(c => c.id === selectedConfigId);
  
  // Create a mock config from predefined set if selected
  const mockConfigFromPredefined = selectedPredefinedSet ? {
    id: selectedPredefinedSet.id,
    name: selectedPredefinedSet.name,
    description: selectedPredefinedSet.description,
    base_price: selectedPredefinedSet.price,
    total_slots: selectedPredefinedSet.samples,
    volume_ml: parseInt(selectedPredefinedSet.configuration.split('×')[1]) || 1,
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
    }
  }, [selectedConfigId, selectedPredefinedSet]);

  if (!activeConfig) {
    // Filter only customizable configs from database
    const customizableConfigs = configs
      .filter(c => c.is_customizable && c.is_active)
      .map((config) => ({
        id: config.id,
        name: config.name,
        description: config.description || '',
        icon: Palette,
        image: config.image_url || '/Discoverybox.png',
        price: config.base_price,
        samples: config.total_slots,
        configuration: `${config.total_slots}×${config.volume_ml}ml`,
        fragrances: [],
        isCustomizable: true
      }));

    if (customizableConfigs.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-2xl font-playfair font-semibold mb-2">Nu există seturi customizabile</h3>
          <p className="text-muted-foreground">
            Momentan nu sunt disponibile seturi pentru personalizare.
          </p>
        </div>
      );
    }

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
    setSelectedProducts(prev => {
      // Remove any existing product from this slot
      const filtered = prev.filter(p => p.slotIndex !== slotIndex);
      // Add the new product to this slot
      return [...filtered, { product, slotIndex }];
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
    
    const selectedItems = selectedProducts.map(sp => ({
      slot_index: sp.slotIndex,
      sku_id: sp.product.id
    }));

    addItem({
      id: generateBundleId(),
      type: 'custom-bundle',
      configId: activeConfig.id,
      selectedItems: selectedItems,
      name: activeConfig.name,
      quantity: 1,
      price: Math.round(calculateTotalPrice() / 100),
      sizeLabel: `${activeConfig.total_slots} mostre`,
      image: activeConfig.image_url || '/placeholder-product.png'
    });

    triggerAnimation();
    
    toast({
      title: "Adăugat în coș!",
      description: `${activeConfig.name} a fost adăugat în coș.`
    });

    // Reset builder
    setSelectedProducts([]);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Generate all slots (empty or filled)
  const generateAllSlots = () => {
    const slots: Array<{ slotIndex: number; product?: Product }> = [];
    for (let i = 0; i < activeConfig.total_slots; i++) {
      const productInSlot = selectedProducts.find(p => p.slotIndex === i)?.product;
      slots.push({
        slotIndex: i,
        product: productInSlot
      });
    }
    return slots;
  };

  const IconComponent = Package;
  const priceInBani = activeConfig.base_price;
  const allSlots = generateAllSlots();

  return (
    <div className="space-y-8">
      {/* Layout similar cu DiscoverySetProduct - 2 coloane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image - Stânga */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden bg-accent/20">
            <img
              src={imageError ? "/Discoverybox.png" : (activeConfig.image_url || '/Discoverybox.png')}
              alt={activeConfig.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
        </div>

        {/* Product Info - Dreapta */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <IconComponent className="h-6 w-6 text-primary" />
              <Badge variant="secondary" className="text-sm">
                {activeConfig.total_slots}×{activeConfig.volume_ml}ml
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-3">
              {activeConfig.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {activeConfig.description}
            </p>
            
            {/* Parfumurile incluse - Carduri goale sau populate */}
            <div className="mb-6">
              <h3 className="text-xl font-playfair font-semibold mb-4">
                Parfumurile incluse
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allSlots.map((slot) => {
                  const product = slot.product;
                  
                  // Card gol - design modern
                  if (!product) {
                    return (
                      <Card 
                        key={slot.slotIndex} 
                        className="group hover:shadow-md transition-all duration-200 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 overflow-hidden bg-muted/20"
                      >
                        <div className="flex gap-3 p-3">
                          {/* Placeholder Image */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                            <Droplets className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                          
                          {/* Placeholder Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-primary">{slot.slotIndex + 1}</span>
                                  </div>
                                  <h4 className="text-sm font-semibold font-playfair text-muted-foreground">
                                    Slot {slot.slotIndex + 1}
                                  </h4>
                                </div>
                                <p className="text-xs text-muted-foreground/60 font-medium mb-2">
                                  Selectează un parfum
                                </p>
                              </div>
                              <Droplets className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  }
                  
                  // Card populat - exact ca în imagine
                  const notes = [
                    ...(product.notes_top || []),
                    ...(product.notes_mid || []),
                    ...(product.notes_base || [])
                  ].slice(0, 3).join(', ');
                  
                  return (
                    <Card 
                      key={slot.slotIndex} 
                      className="group hover:shadow-md transition-all duration-200 border hover:border-primary/30 overflow-hidden"
                    >
                      <div className="flex gap-3 p-3">
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={product.image_url || '/placeholder-product.png'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-product.png';
                            }}
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-primary">{slot.slotIndex + 1}</span>
                                </div>
                                <h4 className="text-sm font-semibold font-playfair truncate">
                                  {product.name}
                                </h4>
                              </div>
                              <p className="text-xs text-primary/80 font-medium mb-2">
                                {product.brand}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Droplets className="h-4 w-4 text-primary/60 flex-shrink-0" />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeProductFromSlot(slot.slotIndex);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Notes */}
                          {notes && (
                            <div className="flex flex-wrap gap-1">
                              {notes.split(', ').slice(0, 3).map((note: string, i: number) => (
                                <Badge 
                                  key={i} 
                                  variant="secondary" 
                                  className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20"
                                >
                                  {note.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(priceInBani)}
              </span>
              <Badge variant="outline" className="text-sm">
                {activeConfig.total_slots} mostre incluse
              </Badge>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="space-y-4">
            <Button
              onClick={handleAddToCart}
              className={`w-full flex items-center gap-2 ${isAnimating ? "bg-green-500 text-white animate-pulse" : ""}`}
              size="lg"
              disabled={!isSetComplete() || isAnimating}
            >
              {isAnimating ? (
                <>
                  <Check className="h-4 w-4" />
                  Adăugat în coș!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Adaugă în coș - {formatPrice(priceInBani)}
                </>
              )}
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm">Livrare gratuită</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm">Livrare în 24h</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm">Parfumuri originale</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selectorul de parfumuri - în locul secțiunii "Despre acest Discovery Set" */}
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
    </div>
  );
};