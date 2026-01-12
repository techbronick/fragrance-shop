import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/database";
import { CheckCircle } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";

interface DiscoveryProductCardProps {
  product: Product;
  hasAvailableSlots: boolean;
  onAddProduct: (product: Product) => void;
}

export const DiscoveryProductCard = ({ 
  product, 
  hasAvailableSlots, 
  onAddProduct 
}: DiscoveryProductCardProps) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleAdd = () => {
    console.log('Button clicked for product:', product.name);
    setIsSelected(true);
    onAddProduct(product);
    setTimeout(() => setIsSelected(false), 1000);
  };

  const fallbackImage = "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=300&h=300&q=75&fm=webp";

  return (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow relative ${isSelected ? 'ring-2 ring-yellow-300 scale-105' : ''}`}>
      <CardContent className="p-2">
        <div className="aspect-square rounded-lg overflow-hidden mb-2 relative bg-muted">
          <OptimizedImage 
            src={product.image_url || fallbackImage}
            alt={`${product.brand} - ${product.name}`}
            className="w-full h-full object-cover"
            fallbackSrc={fallbackImage}
            width={200}
            height={200}
          />
          {isSelected && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg animate-fade-in">
              <CheckCircle className="h-8 w-8 text-yellow-600 animate-bounce" />
            </div>
          )}
        </div>
        <h4 className="font-medium text-xs">{product.brand}</h4>
        <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{product.name}</p>
        <Button 
          onClick={handleAdd}
          disabled={!hasAvailableSlots || isSelected}
          className="w-full"
          size="sm"
        >
          {isSelected ? (
            <span className="flex items-center justify-center text-xs">
              <CheckCircle className="h-4 w-4 mr-1 text-yellow-600" /> Adăugat!
            </span>
          ) : (
            <span className="text-xs">
              {hasAvailableSlots ? "Adaugă" : "Nu mai sunt sloturi"}
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};