import { ShoppingCart, Check } from "lucide-react";
import { Product, SKU } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSKUs } from "@/hooks/useSKUs";
import { formatProductPrice } from "@/utils/formatPrice";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useButtonAnimation } from "@/hooks/useButtonAnimation";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { productPath } from "@/utils/slugs";
import { useToast } from "@/components/ui/use-toast";

interface ProductListCardProps {
  product: Product;
  skus?: SKU[];
}

const ProductListCard = ({ product, skus: skusProp }: ProductListCardProps) => {
  const navigate = useNavigate();
  const href = useLocalizedHref();
  const { t } = useTranslation("product");
  const { t: tCommon } = useTranslation("common");
  const { data: fetchedSkus } = useSKUs(skusProp ? "" : product.id);
  const skus = skusProp ?? fetchedSkus;
  const sortedSkus = useMemo(
    () => (skus ? [...skus].sort((a, b) => a.size_ml - b.size_ml) : []),
    [skus],
  );
  const defaultSkuId =
    sortedSkus.find(s => s.size_ml === 2)?.id ?? sortedSkus[0]?.id ?? "";
  const [selectedSkuId, setSelectedSkuId] = useState<string>("");
  const activeSkuId = selectedSkuId || defaultSkuId;
  const selectedSKU = sortedSkus.find(s => s.id === activeSkuId) ?? null;

  const { addItem } = useCart();
  const { isAnimating, triggerAnimation } = useButtonAnimation();
  const { toast } = useToast();

  const handleProductClick = () => {
    navigate(href(productPath(product)));
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSKU) return;
    addItem({
      id: product.id,
      skuId: selectedSKU.id,
      type: 'product',
      name: product.name,
      brand: product.brand,
      image: product.image_url,
      sizeLabel: selectedSKU.label,
      quantity: 1,
      price: Math.round(selectedSKU.price / 100),
    });
    toast({
      title: tCommon('toast.addedToCart'),
      description: `${product.name} · ${selectedSKU.label}`,
    });
    triggerAnimation();
  };

  const fallbackImage = "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=300&h=300&q=75&fm=webp";

  return (
    <div
      className="group cursor-pointer flex gap-4 sm:gap-6 p-4 rounded-lg border border-border bg-surface transition-[transform,box-shadow] duration-slow ease-default hover:scale-[1.005] hover:shadow-md will-change-transform"
      onClick={handleProductClick}
    >
      {/* Image: plain img (no IntersectionObserver) so it's reliably visible at the
          small fixed sizes used in list view. */}
      <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-white rounded-lg p-2 sm:p-3 md:p-4 overflow-hidden">
        <img
          src={product.image_url || fallbackImage}
          alt={`Parfum ${product.name} de la ${product.brand}`}
          className="w-full h-full object-contain transition-transform duration-slow ease-default group-hover:scale-105 will-change-transform"
          loading="lazy"
          decoding="async"
          width={160}
          height={160}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImage;
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
        {/* Top: Brand, Name, Family */}
        <div className="space-y-1">
          <div className="text-caption text-text-muted">
            {product.brand}
            {product.family && <span> • {product.family}</span>}
          </div>

          <h3 className="text-body line-clamp-2 transition-colors duration-instant group-hover:text-mocha">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-caption text-text-muted line-clamp-2 hidden sm:block">
              {product.description}
            </p>
          )}
        </div>

        {/* Bottom: Size, Price and CTA */}
        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-3">
            {sortedSkus.length > 0 && activeSkuId && (
              <div onClick={(e) => e.stopPropagation()}>
                <Select value={activeSkuId} onValueChange={setSelectedSkuId}>
                  <SelectTrigger
                    className="h-9 px-2 text-caption w-28"
                    aria-label={t('size.select', { defaultValue: `Select size for ${product.name}` })}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedSkus.map(sku => (
                      <SelectItem key={sku.id} value={sku.id} className="text-caption">
                        {sku.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedSKU && (
              <p className="text-body">{formatProductPrice(selectedSKU.price, tCommon('price.byOrder'))}</p>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={handleQuickAdd}
            disabled={isAnimating || !selectedSKU}
          >
            {isAnimating ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                {t("purchase.added")}
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{t("purchase.addToCart")}</span>
                <span className="sm:hidden">{t("purchase.add")}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductListCard;
