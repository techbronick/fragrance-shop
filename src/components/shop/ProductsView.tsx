import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSessionState } from "@/hooks/useSessionState";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, List as ListIcon, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductListCard from "@/components/ProductListCard";
import { Product, SKU } from "@/types/database";
import { Filters, FilterSidebar, EMPTY_FILTERS } from "@/components/shop/FilterSidebar";

export type SortKey =
  | 'featured'
  | 'in-stock-first'
  | 'price-asc'
  | 'price-desc'
  | 'name'
  | 'newest';

type Props = {
  products: Product[];
  filters: Filters;
  onFiltersChange: (next: Filters) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  query: string;
  onQueryChange: (q: string) => void;
  priceByProduct: Map<string, number>;
  inStockByProduct: Map<string, boolean>;
  skusByProduct: Map<string, SKU[]>;
};

const PAGE_SIZE = 24;

function applyFilters(
  products: Product[],
  filters: Filters,
  query: string,
  inStockByProduct: Map<string, boolean>,
): Product[] {
  const q = query.trim().toLowerCase();
  return products.filter(p => {
    if (filters.brand.length > 0 && !filters.brand.includes(p.brand)) return false;
    if (filters.family.length > 0 && !filters.family.includes(p.family)) return false;
    if (filters.gender === 'unisex' && !p.gender_neutral) return false;
    if ((filters.gender === 'male' || filters.gender === 'female') && p.gender_neutral) return false;
    if (filters.inStock && !inStockByProduct.get(p.id)) return false;
    if (q) {
      if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function applySort(
  products: Product[],
  sort: SortKey,
  priceByProduct: Map<string, number>,
  inStockByProduct: Map<string, boolean>,
): Product[] {
  const arr = [...products];
  switch (sort) {
    case 'in-stock-first':
      return arr.sort((a, b) => {
        const aIn = inStockByProduct.get(a.id) ? 0 : 1;
        const bIn = inStockByProduct.get(b.id) ? 0 : 1;
        if (aIn !== bIn) return aIn - bIn;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.name.localeCompare(b.name, 'ro');
      });
    case 'price-asc':
    case 'price-desc': {
      const dir = sort === 'price-asc' ? 1 : -1;
      return arr.sort((a, b) => {
        const pa = priceByProduct.get(a.id);
        const pb = priceByProduct.get(b.id);
        // Products with no price sink to the end regardless of direction
        if (pa === undefined && pb === undefined) return 0;
        if (pa === undefined) return 1;
        if (pb === undefined) return -1;
        return (pa - pb) * dir;
      });
    }
    case 'name':
      return arr.sort((a, b) => {
        const byBrand = a.brand.localeCompare(b.brand, 'ro');
        if (byBrand !== 0) return byBrand;
        return a.name.localeCompare(b.name, 'ro');
      });
    case 'newest':
      return arr.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case 'featured':
    default:
      // Default view: keep the incoming order but float in-stock products
      // to the top so out-of-stock / "La comandă" items sink below. Stable
      // partition preserves relative order within each group.
      return stableInStockFirst(arr, inStockByProduct);
  }
}

// Stable partition: in-stock items keep their order at the front, OOS items
// keep their order at the back.
function stableInStockFirst(
  products: Product[],
  inStockByProduct: Map<string, boolean>,
): Product[] {
  const inStock: Product[] = [];
  const outOfStock: Product[] = [];
  for (const p of products) {
    if (inStockByProduct.get(p.id)) inStock.push(p);
    else outOfStock.push(p);
  }
  return [...inStock, ...outOfStock];
}

export function ProductsView({
  products,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  query,
  onQueryChange,
  priceByProduct,
  inStockByProduct,
  skusByProduct,
}: Props) {
  const { t } = useTranslation('shop');
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // Persist visibleCount per history entry so Back-navigation lands the user
  // on the same number of rendered products they had before leaving.
  const [visibleCount, setVisibleCount] = useSessionState<number>(
    `list:${location.key}:visibleCount`,
    PAGE_SIZE,
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(
    () => applyFilters(products, filters, query, inStockByProduct),
    [products, filters, query, inStockByProduct],
  );
  const sorted = useMemo(
    () => applySort(filtered, sort, priceByProduct, inStockByProduct),
    [filtered, sort, priceByProduct, inStockByProduct],
  );
  const visible = sorted.slice(0, visibleCount);

  // Reset visibleCount when filters/sort/query change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [JSON.stringify(filters), sort, query]);

  const clearAll = () => {
    onFiltersChange(EMPTY_FILTERS);
    onQueryChange('');
  };

  // Active filter chips
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  filters.brand.forEach(b => {
    activeChips.push({
      key: `brand:${b}`,
      label: t('activeFilters.brandPrefix', { value: b }),
      onRemove: () => onFiltersChange({ ...filters, brand: filters.brand.filter(x => x !== b) }),
    });
  });
  filters.family.forEach(f => {
    activeChips.push({
      key: `family:${f}`,
      label: t('activeFilters.familyPrefix', { value: f }),
      onRemove: () => onFiltersChange({ ...filters, family: filters.family.filter(x => x !== f) }),
    });
  });
  if (filters.gender !== 'all') {
    const genderKey: Record<string, string> = {
      male: 'activeFilters.genderMale',
      female: 'activeFilters.genderFemale',
      unisex: 'activeFilters.genderUnisex',
    };
    activeChips.push({
      key: `gender:${filters.gender}`,
      label: t(genderKey[filters.gender]),
      onRemove: () => onFiltersChange({ ...filters, gender: 'all' }),
    });
  }
  if (filters.inStock) {
    activeChips.push({
      key: 'inStock',
      label: t('activeFilters.inStock'),
      onRemove: () => onFiltersChange({ ...filters, inStock: false }),
    });
  }

  const activeFilterCount = activeChips.length;

  return (
    <div className="flex gap-8 lg:gap-12">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-56 shrink-0 lg:sticky lg:top-24 lg:self-start">
        <FilterSidebar
          products={products}
          filters={filters}
          onChange={onFiltersChange}
          onClearAll={clearAll}
        />
      </aside>

      <div className="flex-1 min-w-0">
        {/* Toolbar: sticky below the app header on mobile/tablet so the
            user can refilter, re-sort, or search without scrolling back
            up. Becomes a regular flow element at lg+ where the sidebar
            handles filtering. The negative margins + padding extend the
            blurred backdrop edge-to-edge across the page container's
            built-in padding. */}
        <div className="sticky top-14 md:top-16 z-20 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3 mb-4 bg-paper/95 backdrop-blur-sm border-b border-border/50 lg:static lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent lg:backdrop-blur-none lg:border-b-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Input
            placeholder={t('search.productsPlaceholder')}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="sm:max-w-sm"
          />
          <div className="flex items-center gap-2 sm:ml-auto">
            <Select value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
              <SelectTrigger className="w-44" aria-label={t('sort.label', { defaultValue: 'Sort products' })}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t('sort.featured')}</SelectItem>
                <SelectItem value="in-stock-first">{t('sort.inStockFirst')}</SelectItem>
                <SelectItem value="price-asc">{t('sort.priceAsc')}</SelectItem>
                <SelectItem value="price-desc">{t('sort.priceDesc')}</SelectItem>
                <SelectItem value="name">{t('sort.name')}</SelectItem>
                <SelectItem value="newest">{t('sort.newest')}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border border-border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === 'grid' ? 'bg-surface-2' : ''}
                onClick={() => setViewMode('grid')}
                aria-label={t('viewMode.grid')}
              >
                <LayoutGrid />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === 'list' ? 'bg-surface-2' : ''}
                onClick={() => setViewMode('list')}
                aria-label={t('viewMode.list')}
              >
                <ListIcon />
              </Button>
            </div>
            <Button
              variant="secondary"
              size="md"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              {t('filters.open')}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
          </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {activeChips.map(c => (
              <button
                key={c.key}
                type="button"
                onClick={c.onRemove}
                aria-label={t('activeFilters.removeAriaLabel', { label: c.label })}
                className="duration-instant ease-default"
              >
                <Badge variant="outline" className="cursor-pointer hover:bg-surface-2">
                  {c.label} <X className="h-3 w-3 ml-1" />
                </Badge>
              </button>
            ))}
            {activeChips.length > 1 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-caption text-text-muted hover:text-text duration-instant ease-default"
              >
                {t('filters.clearAll')}
              </button>
            )}
          </div>
        )}

        {/* Grid / list / empty */}
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-h3 md:text-h3-md font-medium text-text-strong mb-4">
              {t('results.empty')}
            </p>
            <Button variant="ghost" onClick={clearAll}>
              {t('filters.clear')}
            </Button>
          </div>
        ) : (
          <>
            <h2 className="sr-only">{t('products.heading', { defaultValue: 'Products' })}</h2>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {visible.map(p => <ProductCard key={p.id} product={p} skus={skusByProduct.get(p.id) ?? []} />)}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {visible.map(p => <ProductListCard key={p.id} product={p} skus={skusByProduct.get(p.id) ?? []} />)}
              </div>
            )}
          </>
        )}

        {/* Load more */}
        {visibleCount < sorted.length && (
          <div className="flex justify-center mt-12">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            >
              {t('results.loadMore')}
            </Button>
          </div>
        )}

        {/* Mobile filter sheet */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="right" className="w-full sm:max-w-[380px] bg-surface p-0 flex flex-col">
            <SheetHeader className="px-6 py-4 border-b border-border">
              <SheetTitle className="text-h2 font-medium text-text-strong">
                {t('filters.title')}
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FilterSidebar
                products={products}
                filters={filters}
                onChange={onFiltersChange}
                onClearAll={clearAll}
              />
            </div>
            <div className="border-t border-border px-6 py-4">
              <SheetClose asChild>
                <Button variant="primary" size="lg" className="w-full">
                  {t('filters.apply')}
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
