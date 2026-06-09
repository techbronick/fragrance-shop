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
      <div className="p-3 space-y-2 flex flex-col flex-1">
        <div className="text-caption text-text-muted truncate">{product.brand}</div>
        {/* min-h-[2lh] reserves exactly two text lines so a one-line name
            and a two-line name produce the same card height across a grid
            or carousel row. */}
        <h3 className="text-body line-clamp-2 min-h-[2lh] transition-colors duration-instant group-hover:text-mocha">
          {product.name}
        </h3>

        {/* min-h-9 reserves the SKU-select row even before SKUs arrive,
            so the card stays the same height across the async load and
            doesn't reflow inside a carousel or grid. */}
        <div className="min-h-9" onClick={(e) => e.stopPropagation()}>
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

        {/* mt-auto pins the price/button row to the bottom so the row
            aligns across cards of differing content height. */}
        <div className="flex items-center justify-between gap-2 pt-1 mt-auto min-h-9">
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
