import { CartItem, useCart } from '@/hooks/useCart';
import { useSKUStocks } from '@/hooks/useSKUStocks';
import { ShippingEstimate } from '@/components/ShippingEstimate';

/**
 * Flatten all SKU ids referenced by the cart, including those nested inside
 * custom-bundle `selectedItems`. Predefined bundles with no `selectedItems`
 * contribute no ids and are therefore treated as in-stock (per spec).
 */
export function collectCartSkuIds(items: CartItem[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    if (item.skuId) ids.push(item.skuId);
    if (item.selectedItems) {
      for (const sel of item.selectedItems) {
        if (sel.sku_id) ids.push(sel.sku_id);
      }
    }
  }
  return ids;
}

type Props = {
  className?: string;
};

export function ShippingEstimateForCart({ className }: Props) {
  const { items } = useCart();
  const skuIds = collectCartSkuIds(items);
  const { data: stocks = [] } = useSKUStocks(skuIds);
  return <ShippingEstimate stocks={stocks} className={className} />;
}
