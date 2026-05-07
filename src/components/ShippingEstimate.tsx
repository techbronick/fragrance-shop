import { useTranslation } from 'react-i18next';
import { getShippingEstimate } from '@/utils/shippingEstimate';

type Props = {
  stocks: number[];
  className?: string;
};

export function ShippingEstimate({ stocks, className }: Props) {
  const { t: tc } = useTranslation('checkout');
  const est = getShippingEstimate(stocks);
  if (!est) return null;

  const key = est.type === 'in_stock' ? 'shippingEstimate.inStock' : 'shippingEstimate.backorder';
  const text = tc(key, { min: est.minDays, max: est.maxDays });

  return (
    <div
      className={
        'text-sm text-muted-foreground ' + (className ?? '')
      }
    >
      {text}
    </div>
  );
}
