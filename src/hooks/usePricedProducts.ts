import { useMemo } from "react";
import { useProducts } from "./useProducts";
import { useAllSKUs } from "./useAllSKUs";

/**
 * Customer-facing product list — products that have at least one SKU,
 * regardless of stock or price. Out-of-stock products remain visible so
 * customers can browse them; the UI surfaces stock state separately.
 */
export function usePricedProducts() {
  const productsQuery = useProducts();
  const { data: allSkus = [], isLoading: skusLoading } = useAllSKUs();

  const productsWithSkus = useMemo(() => {
    const ids = new Set<string>();
    for (const sku of allSkus) ids.add(sku.product_id);
    return ids;
  }, [allSkus]);

  const data = useMemo(() => {
    return (productsQuery.data ?? []).filter((p) => productsWithSkus.has(p.id));
  }, [productsQuery.data, productsWithSkus]);

  return {
    ...productsQuery,
    data,
    isLoading: productsQuery.isLoading || skusLoading,
  };
}
