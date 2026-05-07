import { useEffect, useState, RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DiscoverySetConfig } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";

type Props = {
  config: DiscoverySetConfig;
  quantity: number;
  onAddToCart: () => void;
  watchRef: RefObject<HTMLElement>;
};

export function SetMobileBuyBar({ config, quantity, onAddToCart, watchRef }: Props) {
  const { t } = useTranslation("discovery");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = watchRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchRef]);

  if (!visible) return null;

  const scrollBack = () => {
    watchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={scrollBack}
          className="text-body text-text-strong text-left flex-1 min-w-0 truncate"
        >
          <span className="text-text-muted">{config.volume_ml}ml × {config.total_slots}</span>
          <span className="mx-2 text-text-faint">·</span>
          <span>{formatPrice(config.base_price * quantity)}</span>
        </button>
        <Button variant="primary" size="md" onClick={onAddToCart}>
          {t('purchase.addToCart')}
        </Button>
      </div>
    </div>
  );
}
