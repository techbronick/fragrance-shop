import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageMeta } from "@/hooks/usePageMeta";
import { usePricedProducts } from "@/hooks/usePricedProducts";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { useAllSKUs, buildMinPriceMap, buildInStockMap, buildSkusByProductMap } from "@/hooks/useAllSKUs";
import { ProductsView, SortKey } from "@/components/shop/ProductsView";
import { BrandsView } from "@/components/shop/BrandsView";
import { Filters } from "@/components/shop/FilterSidebar";

const VALID_SORTS: SortKey[] = [
  'featured',
  'in-stock-first',
  'price-asc',
  'price-desc',
  'name',
  'newest',
];

const VALID_GENDERS: Filters['gender'][] = ['all', 'male', 'female', 'unisex'];

const Shop = () => {
  const { t } = useTranslation('shop');
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products = [], isLoading: productsLoading } = usePricedProducts();
  const { data: allSkus = [], isLoading: skusLoading } = useAllSKUs();
  const isLoading = productsLoading || skusLoading;
  const priceByProduct = useMemo(() => buildMinPriceMap(allSkus), [allSkus]);
  const inStockByProduct = useMemo(() => buildInStockMap(allSkus), [allSkus]);
  const skusByProduct = useMemo(() => buildSkusByProductMap(allSkus), [allSkus]);
  const localizedHref = useLocalizedHref();

  const view = searchParams.get('view') === 'brands' ? 'brands' : 'products';

  // URL → filters
  const filters: Filters = {
    brand: searchParams.get('brand')?.split(',').filter(Boolean) ?? [],
    family: searchParams.get('family')?.split(',').filter(Boolean) ?? [],
    gender: (() => {
      const g = searchParams.get('gender');
      return g && (VALID_GENDERS as string[]).includes(g) ? (g as Filters['gender']) : 'all';
    })(),
    inStock: searchParams.get('inStock') === '1',
  };

  const sort: SortKey = (() => {
    const s = searchParams.get('sort');
    return s && (VALID_SORTS as string[]).includes(s) ? (s as SortKey) : 'featured';
  })();

  const query = searchParams.get('q') ?? '';

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const setFilters = (next: Filters) => {
    updateParams({
      brand: next.brand.length > 0 ? next.brand.join(',') : null,
      family: next.family.length > 0 ? next.family.join(',') : null,
      gender: next.gender !== 'all' ? next.gender : null,
      inStock: next.inStock ? '1' : null,
    });
  };

  const setSort = (s: SortKey) => updateParams({ sort: s !== 'featured' ? s : null });
  const setQuery = (q: string) => updateParams({ q: q || null });

  const brandCount = Array.from(new Set(products.map(p => p.brand))).length;

  const countLine = isLoading
    ? '\u00A0' /* nbsp to preserve vertical space */
    : view === 'brands'
      ? t('count.brands', { count: brandCount })
      : t('count.products', { count: products.length });

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="shop"
        titleKey="meta.title"
        descriptionKey="meta.description"
      />
      <Header />

      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12">
          {/* View toggle */}
          <div className="flex gap-6 mb-8">
            <Link
              to={localizedHref('/shop')}
              className={
                view === 'products'
                  ? "text-body text-text-strong font-medium"
                  : "text-body text-text-muted hover:text-text duration-instant ease-default"
              }
            >
              {t('tabs.products')}
            </Link>
            <Link
              to={localizedHref('/shop?view=brands')}
              className={
                view === 'brands'
                  ? "text-body text-text-strong font-medium"
                  : "text-body text-text-muted hover:text-text duration-instant ease-default"
              }
            >
              {t('tabs.brands')}
            </Link>
          </div>

          {/* Page header */}
          <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">{t('title')}</h1>
          <p className="text-caption text-text-muted mt-1 mb-8">{countLine}</p>

          {/* View body */}
          {isLoading ? (
            <ProductsSkeleton />
          ) : products.length === 0 ? (
            <p className="text-h3 font-medium text-text-strong text-center py-16">
              {t('catalogEmpty')}
            </p>
          ) : view === 'products' ? (
            <ProductsView
              products={products}
              filters={filters}
              onFiltersChange={setFilters}
              sort={sort}
              onSortChange={setSort}
              query={query}
              onQueryChange={setQuery}
              priceByProduct={priceByProduct}
              inStockByProduct={inStockByProduct}
              skusByProduct={skusByProduct}
            />
          ) : (
            <BrandsView products={products} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const ProductsSkeleton = () => (
  <div className="flex gap-8 lg:gap-12">
    <aside className="hidden lg:block lg:w-56 shrink-0 space-y-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
          <div className="h-4 w-32 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
          <div className="h-4 w-24 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
          <div className="h-4 w-28 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
        </div>
      ))}
    </aside>
    <div className="flex-1 min-w-0">
      <div className="h-10 w-full max-w-sm bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square bg-surface-2 animate-shimmer skeleton-shimmer rounded-md" />
        ))}
      </div>
    </div>
  </div>
);

export default Shop;
