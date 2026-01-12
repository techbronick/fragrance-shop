// src/components/BrandCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCachedBrandImageUrl } from "@/utils/brandImages";

export type BrandViewMode = "card" | "compact";

interface BrandCardProps {
  brand: string;
  productCount: number;
  tags?: string[];
  onClick: () => void;
  viewMode?: BrandViewMode;
}

const fallbackBrandImage = "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=400&h=400&q=75&fm=webp";

export const BrandCard = ({ 
  brand, 
  productCount, 
  tags = [], 
  onClick,
  viewMode = "card"
}: BrandCardProps) => {
  
  // Compact View
  if (viewMode === "compact") {
    return (
      <button
        onClick={onClick}
        className="group flex items-center gap-3 p-2 rounded-lg border border-border bg-card hover:bg-accent hover:shadow-md transition-all duration-200 text-left w-full"
      >
        {/* Small logo */}
        <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
          <img
            src={getCachedBrandImageUrl(brand)}
            alt={brand}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = fallbackBrandImage;
            }}
          />
        </div>
        
        {/* Brand info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium group-hover:text-primary transition-colors truncate">
            {brand}
          </h3>
          <span className="text-xs text-muted-foreground">
            {productCount} {productCount === 1 ? 'produs' : 'produse'}
          </span>
        </div>
      </button>
    );
  }
  
  // Card View (existing)
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full flex flex-col"
      onClick={onClick}
    >
      <CardContent className="p-2 flex flex-col h-full">
        {/* Fixed aspect-ratio image container */}
        <div className="aspect-square rounded bg-muted mb-2 flex items-center justify-center overflow-hidden relative">
          <img
            src={getCachedBrandImageUrl(brand)}
            alt={brand}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = fallbackBrandImage;
            }}
          />
          
          {/* Desktop: CTA on hover | Mobile: always visible */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-300">
            <Button 
              variant="secondary" 
              size="sm"
              className="text-xs font-medium"
              tabIndex={-1}
            >
              Shop brand
            </Button>
          </div>
        </div>
        
        {/* Fixed content area */}
        <div className="flex-1 flex flex-col justify-between min-h-0">
          <h3 className="text-sm font-playfair font-medium text-center group-hover:text-primary transition-colors line-clamp-2 md:line-clamp-1">
            {brand}
          </h3>
          
          <div className="flex justify-center mt-1">
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              {productCount} {productCount === 1 ? 'produs' : 'produse'}
            </Badge>
          </div>
          
          {tags.length > 0 && (
            <p className="text-[10px] text-muted-foreground text-center mt-1.5 line-clamp-1">
              {tags.slice(0, 3).join(" • ")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandCard;