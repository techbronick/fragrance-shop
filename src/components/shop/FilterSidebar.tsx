import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/database";

export type Filters = {
  brand: string[];
  family: string[];
  gender: 'all' | 'male' | 'female' | 'unisex';
  inStock: boolean;
};

export const EMPTY_FILTERS: Filters = {
  brand: [],
  family: [],
  gender: 'all',
  inStock: false,
};

type Props = {
  products: Product[];
  filters: Filters;
  onChange: (next: Filters) => void;
  onClearAll: () => void;
};

const SECTION_LIMIT = 8;

export function FilterSidebar({ products, filters, onChange, onClearAll }: Props) {
  const { t } = useTranslation('shop');
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const [familiesExpanded, setFamiliesExpanded] = useState(false);

  const allBrands = Array.from(new Set(products.map(p => p.brand))).sort((a, b) => a.localeCompare(b, 'ro'));
  const allFamilies = Array.from(new Set(products.map(p => p.family).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ro'));

  const visibleBrands = brandsExpanded ? allBrands : allBrands.slice(0, SECTION_LIMIT);
  const visibleFamilies = familiesExpanded ? allFamilies : allFamilies.slice(0, SECTION_LIMIT);

  const toggleBrand = (b: string) => {
    onChange({
      ...filters,
      brand: filters.brand.includes(b)
        ? filters.brand.filter(x => x !== b)
        : [...filters.brand, b],
    });
  };

  const toggleFamily = (f: string) => {
    onChange({
      ...filters,
      family: filters.family.includes(f)
        ? filters.family.filter(x => x !== f)
        : [...filters.family, f],
    });
  };

  const setInStock = (v: boolean) => onChange({ ...filters, inStock: v });

  const activeCount =
    filters.brand.length +
    filters.family.length +
    (filters.gender !== 'all' ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  return (
    <div className="space-y-8">
      {/* Brand: hidden when only one distinct brand is present (e.g. on a
          brand page), where a single-option filter is pointless. */}
      {allBrands.length > 1 && (
        <div>
          <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-3">
            {t('filters.brand')}
          </p>
          <div className="space-y-2">
            {visibleBrands.map(b => (
              <label key={b} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.brand.includes(b)}
                  onCheckedChange={() => toggleBrand(b)}
                />
                <span className="text-body text-text">{b}</span>
              </label>
            ))}
          </div>
          {allBrands.length > SECTION_LIMIT && (
            <button
              type="button"
              onClick={() => setBrandsExpanded(e => !e)}
              className="text-caption text-text-muted hover:text-text mt-2 duration-instant ease-default"
            >
              {brandsExpanded ? t('filters.showLess') : t('filters.showAll', { count: allBrands.length })}
            </button>
          )}
        </div>
      )}

      {/* Familie */}
      {allFamilies.length > 0 && (
        <div>
          <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-3">
            {t('filters.family')}
          </p>
          <div className="space-y-2">
            {visibleFamilies.map(f => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.family.includes(f)}
                  onCheckedChange={() => toggleFamily(f)}
                />
                <span className="text-body text-text">{f}</span>
              </label>
            ))}
          </div>
          {allFamilies.length > SECTION_LIMIT && (
            <button
              type="button"
              onClick={() => setFamiliesExpanded(e => !e)}
              className="text-caption text-text-muted hover:text-text mt-2 duration-instant ease-default"
            >
              {familiesExpanded ? t('filters.showLess') : t('filters.showAll', { count: allFamilies.length })}
            </button>
          )}
        </div>
      )}

      {/* Disponibilitate */}
      <div>
        <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-3">
          {t('filters.availability')}
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={filters.inStock}
            onCheckedChange={(v) => setInStock(!!v)}
          />
          <span className="text-body text-text">{t('filters.inStockOnly')}</span>
        </label>
      </div>

      {/* Clear all */}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="w-full">
          {t('filters.clear')}
        </Button>
      )}
    </div>
  );
}
