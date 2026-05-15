import { useTranslation } from "react-i18next";
import { SKU } from "@/types/database";

type Props = {
  skus: SKU[];
  selectedSkuId: string;
  onChange: (sku: SKU) => void;
  className?: string;
};

export function SizeSelector({ skus, selectedSkuId, onChange, className }: Props) {
  const { t } = useTranslation("product");
  // Dedup by (size_ml, price): preserves current Product.tsx behavior
  const seen = new Set<string>();
  const unique = skus
    .filter((s) => {
      const key = s.size_ml + '|' + s.price;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.size_ml - b.size_ml);

  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ''}`}>
      {unique.map((sku) => {
        const isActive = sku.id === selectedSkuId;
        const isOos = sku.stock <= 0;
        return (
          <button
            key={sku.id}
            type="button"
            onClick={() => onChange(sku)}
            aria-pressed={isActive}
            className={
              "rounded-pill px-4 py-2 text-body border transition-colors duration-instant ease-default " +
              (isActive
                ? "bg-mocha text-paper border-mocha"
                : "bg-surface text-text border-border hover:bg-surface-2") +
              (isOos ? " opacity-60" : "")
            }
          >
            {sku.size_ml}{t('size.ml')}
          </button>
        );
      })}
    </div>
  );
}
