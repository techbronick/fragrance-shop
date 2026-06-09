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
import OptimizedImage from "@/components/ui/optimized-image";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { productPath } from "@/utils/slugs";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
  skus?: SKU[];
}

const ProductCard = ({ product, featured = false, skus: skusProp }: ProductCardProps) => {
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

  const [, setImageError] = useState(false);
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
      action: (
        <ToastAction
          altText={tCommon('toast.goToCheckout')}
          onClick={() => navigate(href('/checkout'))}
        >
          {tCommon('toast.goToCheckout')}
        </ToastAction>
      ),
    });
    triggerAnimation();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const fallbackImage = "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=300&h=300&q=75&fm=webp";

  return (
    <div
      className="group cursor-pointer w-full h-full flex flex-col rounded-lg border border-border bg-surface transition-[transform,box-shadow] duration-slow ease-default hover:scale-[1.015] hover:shadow-md will-change-transform"
      onClick={handleProductClick}
    >
      <div className="w-full aspect-square shrink-0 bg-white p-[12%]">
        <OptimizedImage
          src={product.image_url || fallbackImage}
          alt={`Parfum ${product.name} de la ${product.brand}`}
          className="w-full h-full"
          imgClassName="transition-transform duration-slow ease-default group-hover:scale-105 will-change-transform"
          fallbackSrc={fallbackImage}
          width={featured ? 400 : 300}
          height={featured ? 400 : 300}
          onError={handleImageError}
        />
      </div>
      {/* Every row below is a FIXED-height slot so the brand, name, size
          selector and price/button line up pixel-for-pixel across every
          card regardless of name length or whether SKUs have loaded.
          Three zones: header (brand + 2-line name), then the selector,
          then the price/action row pinned to the bottom via mt-auto. */}
      <div className="p-3 flex flex-col flex-1">
        {/* Header: brand (1 line) + name (exactly 2 lines) */}
        <div className="text-caption text-text-muted truncate leading-snug h-[1.25rem]">
          {product.brand}
        </div>
        <h3 className="text-body line-clamp-2 h-[2.6rem] leading-snug mt-1 transition-colors duration-instant group-hover:text-mocha">
          {product.name}
        </h3>

        {/* Size selector slot — fixed 36px row, reserved even before SKUs
            arrive so the layout never reflows. */}
        <div className="h-9 mt-3" onClick={(e) => e.stopPropagation()}>
          {sortedSkus.length > 0 && activeSkuId && (
            <Select value={activeSkuId} onValueChange={setSelectedSkuId}>
              <SelectTrigger
                className="h-9 px-2 text-caption w-full"
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
          )}
        </div>

        {/* Price + action — pinned to the bottom, fixed 36px row so the
            CTA sits at the same baseline on every card. */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-3 h-[3rem]">
          {selectedSKU && (
            <p className="text-body">{formatProductPrice(selectedSKU.price, tCommon('price.byOrder'))}</p>
          )}
          <Button
            size={featured ? "default" : "sm"}
            variant="outline"
            className="shrink-0 ml-auto"
            onClick={e => { e.stopPropagation(); handleQuickAdd(e as React.MouseEvent); }}
            disabled={isAnimating || !selectedSKU}
          >
            {isAnimating ? t("purchase.added") : t("purchase.add")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
