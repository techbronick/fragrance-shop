import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Product, SKU } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";
import { ShippingEstimate } from "@/components/ShippingEstimate";
import { SizeSelector } from "@/components/product/SizeSelector";

type Props = {
  product: Product;
  skus: SKU[];
  selectedSku: SKU | null;
  onSizeChange: (sku: SKU) => void;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: () => void;
};

export function PurchaseBlock({
  product,
  skus,
  selectedSku,
  onSizeChange,
  quantity,
  onQuantityChange,
  onAddToCart,
}: Props) {
  const { t } = useTranslation("product");
  const oos = !!selectedSku && selectedSku.stock <= 0;
  const buttonText = oos ? t('purchase.order') : t('purchase.addToCart');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-caption text-text-muted uppercase tracking-[0.06em]">
          {product.brand}
        </p>
        <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">
          {product.name}
        </h1>
        {product.description && (
          <p className="text-body text-text-muted line-clamp-2">
            {product.description}
          </p>
        )}
      </div>

      {skus.length > 0 ? (
        <SizeSelector
          skus={skus}
          selectedSkuId={selectedSku?.id ?? ''}
          onChange={onSizeChange}
        />
      ) : (
        <p className="text-caption text-text-muted">
          {t('size.noVariants')}
        </p>
      )}

      {selectedSku && (
        <div className="space-y-2">
          <p className="text-h2 md:text-h2-md font-normal text-text-strong">
            {formatPrice(selectedSku.price * quantity)}
          </p>
          <ShippingEstimate stocks={[selectedSku.stock]} />
        </div>
      )}

      {selectedSku && (
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label={t('purchase.decreaseQty')}
          >
            <Minus />
          </Button>
          <span className="text-body min-w-[24px] text-center">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onQuantityChange(quantity + 1)}
            aria-label={t('purchase.increaseQty')}
          >
            <Plus />
          </Button>
        </div>
      )}

      {selectedSku && (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onAddToCart}
        >
          {buttonText}
        </Button>
      )}

      {(product.concentration || product.family) && (
        <>
          <hr className="border-border" />
          <div className="space-y-2">
            {product.concentration && (
              <div className="flex justify-between text-body">
                <span className="text-text-muted">{t('details.concentration')}</span>
                <span className="text-text">{product.concentration}</span>
              </div>
            )}
            {product.family && (
              <div className="flex justify-between text-body">
                <span className="text-text-muted">{t('details.family')}</span>
                <span className="text-text">{product.family}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
