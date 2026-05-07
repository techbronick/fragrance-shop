import { useMemo } from "react";
import { useProducts } from "./useProducts";
import { useAllSKUs } from "./useAllSKUs";

/**
 * Customer-facing product list — only products that have at least one SKU
 * with a positive price. Catalog rows without saleable SKUs are hidden.
 */
export function usePricedProducts() {
  const productsQuery = useProducts();
  const { data: allSkus = [], isLoading: skusLoading } = useAllSKUs();

  const pricedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const sku of allSkus) {
      if (sku.price > 0) ids.add(sku.product_id);
    }
    return ids;
  }, [allSkus]);

  const data = useMemo(() => {
    return (productsQuery.data ?? []).filter((p) => pricedIds.has(p.id));
  }, [productsQuery.data, pricedIds]);

  return {
    ...productsQuery,
    data,
    isLoading: productsQuery.isLoading || skusLoading,
  };
}
