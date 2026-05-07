import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BrandLoader } from "@/components/BrandLoader";
import { PageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { useFxRate } from "@/hooks/useFxRate";
import { useSKUStocks } from "@/hooks/useSKUStocks";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { ShippingEstimate } from "@/components/ShippingEstimate";
import { formatCheckoutPrice } from "@/utils/formatCheckoutPrice";
import { EU_COUNTRY_LABELS, type EuCountryCode, getVatRate } from "@/utils/vat";

const TAX_RATE = 0.15;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-6 py-3 border-b border-border last:border-0">
      <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-32 shrink-0">
        {label}
      </span>
      <span className="flex-1 text-body text-text">{value}</span>
    </div>
  );
}

function TotalsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-body">
      <span className="text-text-muted">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const isPlaced = searchParams.get('placed') === '1';

  const { t, i18n } = useTranslation('order');
  const href = useLocalizedHref();
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useOrder(orderId!);
  const { mdlPerEur } = useFxRate();

  // Collect SKU ids for live shipping estimate (sub-project D pattern)
  const orderSkuIds: string[] = [];
  if (order?.items) {
    for (const item of order.items) {
      if (item.sku_id) orderSkuIds.push(item.sku_id);
      const snapshotItems = item.snapshot?.items;
      if (Array.isArray(snapshotItems)) {
        for (const sub of snapshotItems) {
          if (sub?.sku_id) orderSkuIds.push(sub.sku_id);
        }
      }
    }
  }
  const { data: orderStocks = [] } = useSKUStocks(orderSkuIds);

  if (isLoading) {
    return <BrandLoader />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-4">
              {t('detail.notFound')}
            </h1>
            <Button variant="ghost" onClick={() => navigate(href('/shop'))}>
              {t('detail.backToShop')}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const country = order.shipping_address?.country || 'MD';
  const vatBani = order.total_bani - order.subtotal_bani - order.shipping_bani;
  const taxIncluded = country === 'MD'
    ? Math.round(order.total_bani * (TAX_RATE / (1 + TAX_RATE)))
    : 0;

  const orderShortId = order.id.slice(0, 8).toUpperCase();
  const orderDate = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(
    new Date(order.created_at)
  );

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="order"
        titleKey="meta.title"
        descriptionKey="meta.description"
      />
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12">
          {/* Headline — celebration mode vs detail mode */}
          {isPlaced ? (
            <div className="text-center max-w-2xl mx-auto pt-8 mb-12">
              <div className="inline-flex items-center justify-center h-12 w-12 mb-6">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
              <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-2">
                {t('celebration.title')}
              </h1>
              <p className="text-caption text-text-muted">
                {t('celebration.orderMeta', { id: orderShortId, date: orderDate })}
              </p>
              <p className="text-body text-text-muted mt-6 max-w-md mx-auto">
                {t('celebration.subtitle')}
              </p>
            </div>
          ) : (
            <div className="mb-12">
              <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-2">
                {t('detail.eyebrow')}
              </p>
              <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">
                #{orderShortId}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <p className="text-caption text-text-muted">
                  {t('detail.placedAt', { date: orderDate })}
                </p>
                <Badge variant="outline">{t(`status.${order.status}`, { defaultValue: order.status })}</Badge>
              </div>
            </div>
          )}

          {/* Items section */}
          <section className="mb-16">
            <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
              {t('sections.items')}
            </p>
            <div className="space-y-0">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-4 border-b border-border last:border-0"
                >
                  {item.snapshot?.image_url && (
                    <div className="w-12 h-12 bg-white p-2 overflow-hidden rounded-sm shrink-0">
                      <img
                        src={item.snapshot.image_url}
                        alt={item.snapshot?.product_name || ''}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-text-strong truncate">
                      {item.snapshot?.product_name || item.snapshot?.config?.name || t('item.unknownProduct')}
                    </p>
                    {item.snapshot?.brand && (
                      <p className="text-caption text-text-muted truncate">
                        {item.snapshot.brand}
                      </p>
                    )}
                    {item.snapshot?.size_label ? (
                      <p className="text-caption text-text-muted">
                        {item.snapshot.size_label} · {item.quantity}
                      </p>
                    ) : item.snapshot?.config ? (
                      <p className="text-caption text-text-muted">
                        {item.snapshot.config.total_slots}×{item.snapshot.config.volume_ml}ml · {item.quantity}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-body text-text-strong shrink-0">
                    {formatCheckoutPrice(item.line_total_bani)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-4 mt-4 space-y-2">
              <TotalsRow
                label={t('summary.subtotal')}
                value={formatCheckoutPrice(order.subtotal_bani)}
              />
              <TotalsRow
                label={t('summary.shipping')}
                value={formatCheckoutPrice(order.shipping_bani)}
              />
              {country !== 'MD' && vatBani > 0 && (
                <TotalsRow
                  label={t('summary.vatLabel', { country: EU_COUNTRY_LABELS[country as EuCountryCode], rate: Math.round((getVatRate(country) ?? 0) * 100) })}
                  value={formatCheckoutPrice(vatBani)}
                />
              )}
              <ShippingEstimate stocks={orderStocks} />
            </div>

            {/* Total */}
            <div className="border-t border-border mt-4 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-body text-text-strong font-medium">{t('summary.total')}</span>
                <div className="text-right">
                  <p className="text-h2 md:text-h2-md font-normal text-text-strong">
                    {formatCheckoutPrice(order.total_bani)}
                  </p>
                  <p className="text-caption text-text-muted">
                    MDL{country !== 'MD' && (
                      <> · ≈ €{(order.total_bani / 100 / mdlPerEur).toFixed(2)}</>
                    )}
                  </p>
                </div>
              </div>
              {country === 'MD' && taxIncluded > 0 && (
                <p className="text-caption text-text-muted text-right mt-1">
                  {t('summary.taxIncluded', { amount: formatCheckoutPrice(taxIncluded) })}
                </p>
              )}
            </div>
          </section>

          {/* Contact details */}
          <section className="mb-16">
            <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
              {t('sections.contact')}
            </p>
            <div className="space-y-0">
              <Row label={t('contact.email')} value={order.customer_email || '—'} />
              <Row label={t('contact.phone')} value={order.customer_phone || '—'} />
            </div>
          </section>

          {/* Shipping address */}
          {order.shipping_address && (
            <section className="mb-16">
              <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
                {t('sections.shipping')}
              </p>
              <div className="space-y-1">
                <p className="text-body text-text-strong">{order.customer_name}</p>
                <p className="text-body text-text-muted">{order.shipping_address.address}</p>
                <p className="text-body text-text-muted">
                  {order.shipping_address.city}{order.shipping_address.postalCode ? `, ${order.shipping_address.postalCode}` : ''}
                </p>
                <p className="text-body text-text-muted">{order.shipping_address.country}</p>
              </div>
            </section>
          )}

          {/* Action button */}
          <div className="flex justify-center mt-12">
            <Button variant="ghost" onClick={() => navigate(href('/shop'))}>
              {t('celebration.continueShopping')}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
