import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check } from "lucide-react";
import { Product } from "@/types/database";
import { Filters, FilterSidebar, EMPTY_FILTERS } from "@/components/shop/FilterSidebar";

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name' | 'newest';

type Props = {
  products: Product[];
  priceByProduct?: Map<string, number>;
  selectedIds: Set<string>;
  onToggle: (productId: string) => void;
  canAddMore: boolean;
};

const PAGE_SIZE = 24;

function applyFilters(products: Product[], filters: Filters, query: string): Product[] {
  const q = query.trim().toLowerCase();
  return products.filter(p => {
    if (filters.brand.length > 0 && !filters.brand.includes(p.brand)) return false;
    if (filters.family.length > 0 && !filters.family.includes(p.family)) return false;
    if (filters.gender === 'unisex' && !p.gender_neutral) return false;
    if ((filters.gender === 'male' || filters.gender === 'female') && p.gender_neutral) return false;
    if (q) {
      if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function applySort(
  products: Product[],
  sort: SortKey,
  priceByProduct?: Map<string, number>,
): Product[] {
  const arr = [...products];
  switch (sort) {
    case 'name':
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'ro'));
    case 'newest':
      return arr.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case 'price-asc':
    case 'price-desc': {
      if (!priceByProduct) return arr;
      const dir = sort === 'price-asc' ? 1 : -1;
      return arr.sort((a, b) => {
        const pa = priceByProduct.get(a.id);
        const pb = priceByProduct.get(b.id);
        // Products with no price sink to the end regardless of direction.
        if (pa === undefined && pb === undefined) return 0;
        if (pa === undefined) return 1;
        if (pb === undefined) return -1;
        return (pa - pb) * dir;
      });
    }
    case 'featured':
    default:
      return arr;
  }
}

export function SetCatalogPane({ products, priceByProduct, selectedIds, onToggle, canAddMore }: Props) {
  const { t } = useTranslation("discovery");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>('featured');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => applyFilters(products, filters, query), [products, filters, query]);
  const sorted = useMemo(() => applySort(filtered, sort, priceByProduct), [filtered, sort, priceByProduct]);
  const visible = sorted.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [JSON.stringify(filters), sort, query]);

  return (
    <div className="flex gap-8 lg:gap-12">
      <aside className="hidden lg:block lg:w-56 shrink-0 lg:sticky lg:top-24 lg:self-start">
        <FilterSidebar
          products={products}
          filters={filters}
          onChange={setFilters}
          onClearAll={() => setFilters(EMPTY_FILTERS)}
        />
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <Input
            placeholder={t('builder.catalog.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-sm"
          />
          <div className="flex items-center gap-2 sm:ml-auto">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t('builder.catalog.sortFeatured')}</SelectItem>
                <SelectItem value="price-asc">{t('builder.catalog.sortPriceAsc')}</SelectItem>
                <SelectItem value="price-desc">{t('builder.catalog.sortPriceDesc')}</SelectItem>
                <SelectItem value="name">{t('builder.catalog.sortName')}</SelectItem>
                <SelectItem value="newest">{t('builder.catalog.sortNewest')}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="md"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              {t('builder.catalog.filters')}
            </Button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-h3 md:text-h3-md font-medium text-text-strong">
              {t('builder.catalog.empty')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {visible.map(product => {
              const isSelected = selectedIds.has(product.id);
              const disabled = !canAddMore && !isSelected;
              const imgSrc = product.image_url || "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=600&h=600&q=75&fm=webp";
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onToggle(product.id)}
                  disabled={disabled}
                  className={
                    "group relative w-full bg-surface border rounded-lg text-left duration-instant ease-default " +
                    (isSelected
                      ? "border-mocha bg-mocha-soft"
                      : "border-border hover:bg-surface-2") +
                    (disabled ? " opacity-50 cursor-not-allowed" : "")
                  }
                >
                  <div className="aspect-square bg-white p-3 sm:p-4 md:p-5 rounded-t-lg">
                    <img
                      src={imgSrc}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-slow ease-default group-hover:scale-105 will-change-transform"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=600&h=600&q=75&fm=webp";
                      }}
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-caption text-text-muted truncate">{product.brand}</p>
                    <p className="text-body text-text-strong truncate">{product.name}</p>
                  </div>
                  <div
                    className={
                      "absolute top-2 right-2 h-8 w-8 rounded-pill flex items-center justify-center " +
                      (isSelected
                        ? "bg-mocha text-paper"
                        : "bg-paper text-text border border-border")
                    }
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {visibleCount < sorted.length && (
          <div className="flex justify-center mt-12">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            >
              {t('builder.catalog.loadMore')}
            </Button>
          </div>
        )}

        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="right" className="w-full sm:max-w-[380px] bg-surface p-0 flex flex-col">
            <SheetHeader className="px-6 py-4 border-b border-border">
              <SheetTitle className="text-h2 font-medium text-text-strong">{t('builder.catalog.filtersTitle')}</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FilterSidebar
                products={products}
                filters={filters}
                onChange={setFilters}
                onClearAll={() => setFilters(EMPTY_FILTERS)}
              />
            </div>
            <div className="border-t border-border px-6 py-4">
              <SheetClose asChild>
                <Button variant="primary" size="lg" className="w-full">{t('builder.catalog.apply')}</Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
