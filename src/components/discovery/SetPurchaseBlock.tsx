import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { DiscoverySetConfig } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";
import { ShippingEstimate } from "@/components/ShippingEstimate";

type Props = {
  config: DiscoverySetConfig;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: () => void;
  isAdding: boolean;
};

export function SetPurchaseBlock({
  config,
  quantity,
  onQuantityChange,
  onAddToCart,
  isAdding,
}: Props) {
  const { t } = useTranslation("discovery");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-caption text-text-muted uppercase tracking-[0.06em]">
          {t('set.discoverySet')}
        </p>
        <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">
          {config.name}
        </h1>
        {config.description && (
          <p className="text-body text-text-muted line-clamp-2">
            {config.description}
          </p>
        )}
        <p className="text-body text-text-muted">
          {config.total_slots} {t('set.sample', { count: config.total_slots })} × {config.volume_ml}ml
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-h2 md:text-h2-md font-normal text-text-strong">
          {formatPrice(config.base_price * quantity)}
        </p>
        <ShippingEstimate stocks={[]} />
      </div>

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

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={onAddToCart}
        disabled={isAdding}
      >
        {isAdding ? t('purchase.processing') : t('purchase.addToCart')}
      </Button>
    </div>
  );
}
