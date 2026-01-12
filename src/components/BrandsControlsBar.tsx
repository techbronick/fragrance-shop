import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, LayoutGrid, LayoutList, ArrowRight } from "lucide-react";
import { BrandViewMode } from "@/components/BrandCard";

interface BrandsControlsBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  viewMode: BrandViewMode;
  onViewModeChange: (mode: BrandViewMode) => void;
  onViewAllProducts: () => void;
}

export const BrandsControlsBar = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  searchInputRef,
  viewMode,
  onViewModeChange,
  onViewAllProducts,
}: BrandsControlsBarProps) => {
  const [isMac, setIsMac] = useState(false);
  
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const keyboardHint = isMac ? "⌘K" : "Ctrl+K";

  const handleViewAllProducts = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'brands_view_all_products_click', {
        event_category: 'navigation',
        event_label: 'View All Products from Brands Page'
      });
    }
    console.log('[Analytics] brands_view_all_products_click');
    onViewAllProducts();
  };

  return (
    <div className="brands-controls-bar" id="brands-controls-bar">
      {/* Left: Search Input */}
      <div className="brands-controls-search">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Caută branduri..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-20 h-10"
            aria-label="Caută branduri"
          />
          {!searchQuery && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] text-muted-foreground bg-muted rounded border border-border font-mono">
                {keyboardHint}
              </kbd>
            </span>
          )}
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Șterge căutarea"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right: View All + View Toggle */}
      <div className="brands-controls-right">
        {/* View All Products - text link */}
        <button
          onClick={handleViewAllProducts}
          className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
        >
          <span className="hidden sm:inline">Vezi toate produsele</span>
          <span className="sm:hidden">Toate</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* View Mode Toggle - icons only */}
        <div className="flex border border-border rounded-lg overflow-hidden h-9">
          <button
            onClick={() => onViewModeChange("card")}
            className={`
              flex items-center justify-center w-9 h-full transition-colors
              ${viewMode === "card" 
                ? "bg-primary text-primary-foreground" 
                : "bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
              }
            `}
            aria-pressed={viewMode === "card"}
            aria-label="Vizualizare carduri"
            title="Carduri"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("compact")}
            className={`
              flex items-center justify-center w-9 h-full transition-colors
              ${viewMode === "compact" 
                ? "bg-primary text-primary-foreground" 
                : "bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
              }
            `}
            aria-pressed={viewMode === "compact"}
            aria-label="Vizualizare compactă"
            title="Compact"
          >
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandsControlsBar;