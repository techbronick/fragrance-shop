import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Product, SKU } from "@/types/database";
import { formatProductPrice } from "@/utils/formatPrice";
import { ShippingEstimate } from "@/components/ShippingEstimate";
import { SizeSelector } from "@/components/product/SizeSelector";
import { whatsappLink } from "@/utils/whatsapp";
import { useLayoutEffect, useRef, useState } from "react";

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
  const { t: tCommon } = useTranslation("common");
  const oos = !!selectedSku && selectedSku.stock <= 0;
  // Out-of-stock SKUs route the customer to WhatsApp instead of the
  // cart: we can't fulfil the order on the spot, so we open a chat to
  // confirm availability and ETA before they commit.
  const waMessage = selectedSku
    ? t('purchase.whatsappOosMessage', {
        brand: product.brand,
        name: product.name,
        size: selectedSku.label,
      })
    : '';

  // Read-more state: only render the toggle when the description actually
  // overflows the 2-line clamp. Measured against scroll/client-height after
  // layout; recomputed on resize (line count changes with viewport width).
  const descRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  useLayoutEffect(() => {
    const measure = () => {
      const el = descRef.current;
      if (!el) return;
      // Measure the clamped state: temporarily ensure clamp is applied.
      const wasExpanded = expanded;
      if (wasExpanded) return; // keep current state; user already opened it
      setCanExpand(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [product.description, expanded]);

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
          <>
            <p
              ref={descRef}
              className={`text-body text-text-muted ${expanded ? "" : "line-clamp-2"}`}
            >
              {product.description}
            </p>
            {(canExpand || expanded) && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="text-caption text-text-muted hover:text-text underline underline-offset-2 mt-1 duration-instant ease-default"
              >
                {expanded ? t("description.readLess") : t("description.readMore")}
              </button>
            )}
          </>
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
            {formatProductPrice(selectedSku.price * quantity, tCommon('price.byOrder'))}
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

      {selectedSku && !oos && (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onAddToCart}
        >
          {t('purchase.addToCart')}
        </Button>
      )}
      {selectedSku && oos && (
        <a
          href={whatsappLink(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-mocha hover:bg-mocha-hover text-paper text-body font-medium px-4 py-3 transition-colors duration-instant ease-default"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01zM12.04 20.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.22 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42l-.48-.01a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.56.12.16 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.31z"/>
          </svg>
          {t('purchase.contactWhatsapp')}
        </a>
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
