import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { useBrandList } from "@/hooks/useProducts";
import { usePricedProducts } from "@/hooks/usePricedProducts";
import { useAllSKUs } from "@/hooks/useAllSKUs";
import { brandPath } from "@/utils/slugs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCachedBrandImageUrl } from "@/utils/brandImages";

// Same fallback the BrandCard component uses, so an unmapped brand image
// degrades identically across the site.
const fallbackBrandImage =
  "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=400&h=400&q=75&fm=webp";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function BrandWall() {
  const { t } = useTranslation("common");
  const href = useLocalizedHref();
  const { data: brandNames = [], isLoading: brandsLoading } = useBrandList();
  const { data: products = [], isLoading: productsLoading } = usePricedProducts();
  const { data: allSkus = [], isLoading: skusLoading } = useAllSKUs();
  const stockReady = !productsLoading && !skusLoading;

  // Brands with at least one product that has at least one in-stock SKU.
  // Both queries are cached app-wide, so this doesn't trigger fresh fetches
  // if other parts of the home have already warmed them.
  const inStockBrands = useMemo(() => {
    const stockedProductIds = new Set<string>();
    for (const sku of allSkus) {
      if (sku.stock > 0) stockedProductIds.add(sku.product_id);
    }
    const set = new Set<string>();
    for (const p of products) {
      if (stockedProductIds.has(p.id)) set.add(p.brand);
    }
    return set;
  }, [products, allSkus]);

  // Show in-stock brands only. While stock data is still loading we fall
  // back to the full list to avoid flashing an empty section on a cold
  // home page; once loaded, the filter takes over.
  const brands = useMemo(() => {
    const pool = stockReady
      ? brandNames.filter((b) => inStockBrands.has(b))
      : brandNames;
    return shuffle(pool);
  }, [brandNames, inStockBrands, stockReady]);

  // Show a static row of skeleton tiles while the brand list query is
  // still in flight, so the home doesn't render a blank gap between the
  // hero and the next section.
  if (brandsLoading && brandNames.length === 0) {
    return (
      <section className="relative w-full bg-surface border-y border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-14 md:pt-20 pb-8 md:pb-10 flex items-center justify-center gap-4">
          <span className="h-px w-12 md:w-16 bg-border" aria-hidden="true" />
          <Skeleton className="h-3 w-40 rounded-sm" />
          <span className="h-px w-12 md:w-16 bg-border" aria-hidden="true" />
        </div>
        <div className="pb-14 md:pb-20 overflow-hidden">
          <div className="flex gap-4 md:gap-6 px-4 sm:px-6 md:px-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shrink-0 w-40 md:w-48">
                <Card>
                  <CardContent className="p-2">
                    <Skeleton className="aspect-square w-full rounded mb-2" />
                    <Skeleton className="h-4 w-2/3 mx-auto rounded-sm" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (brands.length === 0) return null;

  // Duplicate for seamless looping.
  const loop = [...brands, ...brands];

  // Speed scales with brand count so each card spends roughly the same time
  // on screen regardless of how many brands there are.
  const animationDuration = `${brands.length * 20}s`;

  return (
    <section className="relative w-full bg-surface border-y border-border">
      {/* Eyebrow label: clickable, jumps to the brands view of the shop. */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-14 md:pt-20 pb-8 md:pb-10 flex items-center justify-center gap-4">
        <span className="h-px w-12 md:w-16 bg-border" aria-hidden="true" />
        <Link
          to={href("/shop?view=brands")}
          className="text-caption uppercase tracking-[0.22em] text-text-muted hover:text-text-strong duration-instant ease-default"
        >
          {t("brandWall.eyebrow")}
        </Link>
        <span className="h-px w-12 md:w-16 bg-border" aria-hidden="true" />
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden pb-8 md:pb-10 group">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-40 z-10 bg-gradient-to-r from-surface to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-40 z-10 bg-gradient-to-l from-surface to-transparent"
          aria-hidden="true"
        />

        <div
          className="flex w-max animate-marquee group-hover:[animation-play-state:paused] py-2"
          style={{ animationDuration }}
        >
          {loop.map((name, i) => (
            <Link
              key={`${name}-${i}`}
              to={href(brandPath(name))}
              aria-label={name}
              className="group/bw shrink-0 w-40 md:w-48 mx-2 md:mx-3"
            >
              {/* Same card layout, border + hover effects as BrandCard */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-2">
                  <div className="aspect-square rounded bg-muted mb-2 overflow-hidden relative">
                    <img
                      src={getCachedBrandImageUrl(name)}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackBrandImage;
                      }}
                    />
                    {/* Desktop hover overlay: marquee pauses on hover via the
                        outer group, so the card sits still while shown */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 md:group-hover/bw:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs font-medium"
                        tabIndex={-1}
                      >
                        {t("brandWall.shopBrand")}
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-center group-hover/bw:text-primary transition-colors truncate">
                    {name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Prominent CTA to the full brands listing on the shop. */}
      <div className="flex justify-center pb-14 md:pb-20">
        <Link
          to={href("/shop?view=brands")}
          className="text-caption uppercase tracking-[0.12em] text-text-muted hover:text-text-strong underline underline-offset-4 duration-instant ease-default"
        >
          {t("brandWall.viewAll")}
        </Link>
      </div>
    </section>
  );
}
