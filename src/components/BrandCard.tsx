// src/components/BrandCard.tsx
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
  
  // Card view: mirrors ProductCard's stylistic so brand and product cards
  // sit alongside each other on the shop page with a consistent rhythm:
  // same outer wrapper (rounded-lg border, hover scale + shadow), same
  // image-area treatment (aspect-square + inner group-hover zoom), same
  // content typography (text-caption muted, text-body with mocha hover).
  return (
    <div
      className="group cursor-pointer h-full flex flex-col rounded-lg border border-border bg-surface transition-[transform,box-shadow] duration-slow ease-default hover:scale-[1.015] hover:shadow-md will-change-transform"
      onClick={onClick}
    >
      <div className="w-full aspect-square shrink-0 bg-white overflow-hidden">
        <img
          src={getCachedBrandImageUrl(brand)}
          alt={brand}
          className="w-full h-full object-cover transition-transform duration-slow ease-default group-hover:scale-105 will-change-transform"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = fallbackBrandImage;
          }}
        />
      </div>
      <div className="p-3 space-y-1 flex flex-col flex-1">
        {/* Reserve two lines so single-word and multi-word brand names
            produce the same card height in a grid row. */}
        <h3 className="text-body line-clamp-2 min-h-[2lh] transition-colors duration-instant group-hover:text-mocha">
          {brand}
        </h3>
        <div className="text-caption text-text-muted">
          {productCount} {productCount === 1 ? 'produs' : 'produse'}
        </div>
        {tags.length > 0 && (
          <p className="text-caption text-text-muted line-clamp-1">
            {tags.slice(0, 3).join(" • ")}
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandCard;