import { Star, ShoppingCart, Check } from "lucide-react";
import { Product } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSKUs } from "@/hooks/useSKUs";
import { formatPrice } from "@/utils/formatPrice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useButtonAnimation } from "@/hooks/useButtonAnimation";
import OptimizedImage from "@/components/ui/optimized-image";

interface ProductListCardProps {
  product: Product;
}

const ProductListCard = ({ product }: ProductListCardProps) => {
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

  const fallbackImage = "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=300&h=300&q=75&fm=webp";

  return (
    <div
      className="group cursor-pointer flex gap-4 sm:gap-6 p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 bg-card"
      onClick={handleProductClick}
    >
      {/* Image */}
      <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40">
        <OptimizedImage
          src={product.image_url || fallbackImage}
          alt={`Parfum ${product.name} de la ${product.brand}`}
          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
          fallbackSrc={fallbackImage}
          width={160}
          height={160}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
        {/* Top: Brand, Name, Family */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs font-medium">
              {product.brand}
            </Badge>
            {product.family && (
              <span className="text-xs text-muted-foreground">{product.family}</span>
            )}
            {product.gender_neutral && (
              <span className="text-xs text-muted-foreground capitalize">• {product.gender_neutral ? "Unisex" : "Specific"}</span>
            )}
          </div>
          
          <h3 className="font-playfair font-semibold text-base sm:text-lg md:text-xl group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 hidden sm:block">
              {product.description}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= Math.round(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">
              {product.rating} ({product.review_count} recenzii)
            </span>
          </div>
        </div>

        {/* Bottom: Price and CTA */}
        <div className="flex items-end justify-between gap-4 mt-3">
          <div>
            {defaultSKU && (
              <>
                <p className="text-lg sm:text-xl font-bold text-primary">
                  De la {formatPrice(defaultSKU.price)}
                </p>
                <p className="text-xs text-muted-foreground">{defaultSKU.label}</p>
              </>
            )}
          </div>

          <Button
            size="sm"
            variant={isAnimating ? "default" : "outline"}
            className={`shrink-0 ${isAnimating ? "bg-green-500 hover:bg-green-500 text-white" : ""}`}
            onClick={handleQuickAdd}
            disabled={isAnimating}
          >
            {isAnimating ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Adăugat
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Adaugă în coș</span>
                <span className="sm:hidden">Adaugă</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductListCard;