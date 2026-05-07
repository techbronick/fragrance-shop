import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import BrandCard from "@/components/BrandCard";
import { Product } from "@/types/database";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";

type Props = {
  products: Product[];
};

export function BrandsView({ products }: Props) {
  const { t } = useTranslation('shop');
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const localizedHref = useLocalizedHref();

  const brandProductCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.brand, (map.get(p.brand) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const allBrands = useMemo(
    () => Array.from(new Set(products.map(p => p.brand))).sort((a, b) => a.localeCompare(b, 'ro')),
    [products]
  );

  const filteredBrands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allBrands;
    return allBrands.filter(b => b.toLowerCase().includes(q));
  }, [allBrands, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const b of filteredBrands) {
      const letter = b.charAt(0).toLocaleUpperCase('ro');
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(b);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'ro'));
  }, [filteredBrands]);

  return (
    <div>
      <Input
        placeholder={t('search.brandsPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md mb-12"
      />

      {grouped.length === 0 ? (
        <p className="text-body text-text-muted text-center py-16">
          {t('brands.empty', { query })}
        </p>
      ) : (
        grouped.map(([letter, brands]) => (
          <section key={letter} className="mb-16">
            <p className="text-h2 md:text-h2-md font-medium text-text-strong mb-6">
              {letter}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brands.map(b => (
                <BrandCard
                  key={b}
                  brand={b}
                  productCount={brandProductCounts.get(b) ?? 0}
                  onClick={() => navigate(localizedHref(`/shop?brand=${encodeURIComponent(b)}`))}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
