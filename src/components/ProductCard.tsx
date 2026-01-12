import { Star } from "lucide-react";
import { Product } from "@/types/database";
import { Button } from "@/components/ui/button";
import { useSKUs } from "@/hooks/useSKUs";
import { formatPrice } from "@/utils/formatPrice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useButtonAnimation } from "@/hooks/useButtonAnimation";
import OptimizedImage from "@/components/ui/optimized-image";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

const ProductCard = ({ product, featured = false }: ProductCardProps) => {
  const navigate = useNavigate();
  const { data: skus } = useSKUs(product.id);
  const defaultSKU = skus?.find(sku => sku.size_ml === 2) || skus?.[0];
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCart();
  const { isAnimating, triggerAnimation } = useButtonAnimation();

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!defaultSKU) return;
    addItem({
      id: product.id,
      skuId: defaultSKU.id,
      type: 'product',
      name: product.name,
      brand: product.brand,
      image: product.image_url,
      sizeLabel: defaultSKU.label,
      quantity: 1,
      price: Math.round(defaultSKU.price / 100),
    });
    triggerAnimation();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const fallbackImage = "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=300&h=300&q=75&fm=webp";

  return (
    <div
      className={
        featured
          ? "group cursor-pointer animate-fade-in bg-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 p-6 flex flex-col items-center border border-primary/10"
          : "group cursor-pointer animate-fade-in p-1"
      }
      onClick={handleProductClick}
    >
      {featured && (
        <div className="mb-3 w-full flex justify-center">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase shadow-sm">
            {product.brand}
          </span>
        </div>
      )}
      <OptimizedImage
        src={product.image_url || fallbackImage}
        alt={`Parfum ${product.name} de la ${product.brand}`}
        className={featured ? "aspect-square rounded-xl mb-4 w-full max-w-xs object-cover group-hover:scale-105 transition-transform duration-300" : "aspect-square rounded mb-1 group-hover:scale-105 transition-transform duration-300"}
        fallbackSrc={fallbackImage}
        width={featured ? 400 : 300}
        height={featured ? 400 : 300}
        onError={handleImageError}
      />
      <div className={featured ? "w-full flex flex-col items-center text-center space-y-2" : "space-y-0.5"}>
        {!featured && (
          <div className="flex items-center space-x-1 text-[10px] text-muted-foreground">
            <span>{product.brand}</span>
            <span>•</span>
            <span>{product.family}</span>
          </div>
        )}
        <h3 className={featured ? "font-playfair font-semibold text-2xl group-hover:text-primary transition-colors line-clamp-2" : "font-playfair font-medium text-xs group-hover:text-primary transition-colors line-clamp-2"}>
          {product.name}
        </h3>
        {featured && product.family && (
          <div className="text-sm text-muted-foreground mb-1">{product.family}</div>
        )}
        <div className={featured ? "flex items-center justify-center gap-2 mb-2" : "flex items-center space-x-1"}>
          <div className="flex items-center">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} className={featured ? `h-4 w-4 ${star <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}` : `h-3 w-3 ${star <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            ))}
            <span className={featured ? "text-sm text-muted-foreground ml-2" : "text-[10px] text-muted-foreground ml-1"}>
              {product.rating} ({product.review_count})
            </span>
          </div>
        </div>
        {featured && product.description && (
          <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</div>
        )}
        <div className={featured ? "w-full flex flex-col items-center gap-2 mt-2" : "flex items-center justify-between"}>
          <div className={featured ? "text-lg font-bold text-primary" : "space-y-0"}>
            {defaultSKU && (
              <>
                <p className={featured ? "text-lg font-bold text-primary" : "text-xs font-medium text-foreground"}>De la {formatPrice(defaultSKU.price)}</p>
                <p className={featured ? "text-xs text-muted-foreground" : "text-[10px] text-muted-foreground"}>{defaultSKU.label}</p>
              </>
            )}
          </div>
          <Button
            size={featured ? "lg" : "icon"}
            variant={featured ? "default" : "outline"}
            className={`${featured ? "w-full mt-2" : "shrink-0 h-5 w-5 p-0"} ${isAnimating ? "animate-pulse bg-green-500 text-white" : ""}`}
            onClick={e => { e.stopPropagation(); handleQuickAdd(e as any); }}
            disabled={isAnimating}
          >
            {featured ? (
              <>
                {isAnimating ? "Adăugat!" : "Adaugă în coș"}
                {isAnimating ? (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="ml-2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="ml-2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </>
            ) : (
              <>
                <span className="sr-only">Adaugă Rapid</span>
                {isAnimating ? (
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
