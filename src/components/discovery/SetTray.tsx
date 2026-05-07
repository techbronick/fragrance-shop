import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Product } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";


type Props = {
  selected: Product[];
  totalSlots: number;
  subtotal: number;
  onRemove: (productId: string) => void;
  onAddToCart: () => void;
  isAdding: boolean;
};

export function SetTray({
  selected,
  totalSlots,
  subtotal,
  onRemove,
  onAddToCart,
  isAdding,
}: Props) {
  const { t } = useTranslation("discovery");
  const { t: tCommon } = useTranslation("common");
  const emptySlots = Math.max(0, totalSlots - selected.length);
  const isFull = selected.length === totalSlots;

  return (
    <aside className="bg-surface border border-border rounded-lg p-6">
      <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-1">
        {t('builder.slotsLabel')}
      </p>
      <p className="text-body text-text-strong mb-4">
        {t('builder.slotsCount', { selected: selected.length, total: totalSlots })} {t('builder.slotsUnit', { count: totalSlots })}
      </p>

      <div className="flex gap-1 mb-6">
        {Array.from({ length: totalSlots }).map((_, i) => (
          <div
            key={i}
            className={
              "h-1 flex-1 rounded-pill " +
              (i < selected.length ? "bg-mocha" : "bg-surface-2")
            }
          />
        ))}
      </div>

      <div className="space-y-3 mb-6">
        {selected.map(product => (
          <div key={product.id} className="flex items-center gap-3">
            {product.image_url && (
              <div className="w-10 h-10 bg-white p-2 overflow-hidden rounded-sm shrink-0">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-body text-text-strong truncate">{product.name}</p>
              <p className="text-caption text-text-muted truncate">{product.brand}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(product.id)}
              aria-label={tCommon('cart.remove')}
            >
              <X />
            </Button>
          </div>
        ))}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} className="flex items-center gap-3 opacity-50">
            <div className="w-10 h-10 rounded-sm bg-surface-2 shrink-0" />
            <p className="text-body text-text-muted">{t('builder.slotEmpty')}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4 mb-4">
        <div className="flex justify-between text-body">
          <span className="text-text-muted">{t('builder.subtotal')}</span>
          <span className="text-text-strong">{formatPrice(subtotal)}</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={selected.length === 0 || isAdding}
        onClick={onAddToCart}
      >
        {isAdding
          ? t('builder.processing')
          : isFull
            ? t('builder.addToCart')
            : t('builder.continue', { selected: selected.length, total: totalSlots })}
      </Button>
    </aside>
  );
}
