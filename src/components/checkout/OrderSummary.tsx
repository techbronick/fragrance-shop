import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ShippingEstimateForCart } from "@/components/ShippingEstimateForCart";
import { CartItem } from "@/hooks/useCart";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { formatProductPrice } from "@/utils/formatPrice";
import { formatCheckoutPrice } from "@/utils/formatCheckoutPrice";
import { getVatRate } from "@/utils/vat";

type Totals = {
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
  taxIncluded: number;
};

type Props = {
  items: CartItem[];
  totals: Totals;
  country: string;
  mdlPerEur: number;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-body">
      <span className="text-text-muted">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}

export function OrderSummary({ items, totals, country, mdlPerEur }: Props) {
  const navigate = useNavigate();
  const href = useLocalizedHref();
  const { t: tc } = useTranslation("checkout");
  const { t: tCommon } = useTranslation("common");
  const byOrder = tCommon("price.byOrder");

  if (items.length === 0) {
    return (
      <aside className="bg-surface border border-border rounded-lg p-6 md:p-8 text-center">
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-4">
          {tc('summary.title')}
        </p>
        <p className="text-body text-text-muted">{tc('summary.empty')}</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(href('/shop'))}>
          {tc('summary.backToShop')}
        </Button>
      </aside>
    );
  }

  const vatRate = getVatRate(country);
  const vatRatePercent = vatRate !== null ? Math.round(vatRate * 100) : 0;

  return (
    <aside className="bg-surface border border-border rounded-lg p-6 md:p-8">
      <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-4">
        {tc('summary.title')}
      </p>

      {/* Line items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.id + (item.skuId ?? '')} className="flex gap-3">
            {item.image && (
              <div className="w-12 h-12 bg-white p-2 overflow-hidden rounded-sm shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-body text-text-strong truncate">{item.name}</p>
              {item.sizeLabel && (
                <p className="text-caption text-text-muted">
                  {item.sizeLabel} × {item.quantity}
                </p>
              )}
            </div>
            <p className="text-body text-text-strong shrink-0">
              {formatProductPrice(item.price * 100 * item.quantity, byOrder)}
            </p>
          </div>
        ))}
      </div>

      {/* Subtotal / Shipping / VAT */}
      <div className="border-t border-border pt-4 space-y-2">
        <Row label={tc('summary.subtotal')} value={totals.subtotal > 0 ? formatCheckoutPrice(totals.subtotal) : byOrder} />
        <Row label={tc('summary.shipping')} value={formatCheckoutPrice(totals.shipping)} />
        {country !== 'MD' && vatRate !== null && (
          <Row
            label={tc('summary.vat', { rate: vatRatePercent })}
            value={formatCheckoutPrice(totals.vat)}
          />
        )}
        <ShippingEstimateForCart />
      </div>

      {/* Total */}
      <div className="border-t border-border mt-4 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-body text-text-strong font-medium">{tc('summary.total')}</span>
          <div className="text-right">
            <p className="text-h2 md:text-h2-md font-normal text-text-strong">
              {totals.total > 0 ? formatCheckoutPrice(totals.total) : byOrder}
            </p>
            {totals.total > 0 && (
              <p className="text-caption text-text-muted">
                MDL{country !== 'MD' && (
                  <> · ≈ €{(totals.total / 100 / mdlPerEur).toFixed(2)}</>
                )}
              </p>
            )}
          </div>
        </div>
        {totals.taxIncluded > 0 && (
          <p className="text-caption text-text-muted text-right mt-1">
            {tc('summary.taxIncluded', { amount: formatCheckoutPrice(totals.taxIncluded) })}
          </p>
        )}
      </div>
    </aside>
  );
}
