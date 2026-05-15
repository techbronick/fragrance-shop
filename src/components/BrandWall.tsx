import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { useBrandList } from "@/hooks/useProducts";
import { brandPath } from "@/utils/slugs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const { data: brandNames = [] } = useBrandList();

  // Shuffled fresh on every mount.
  const brands = useMemo(() => shuffle(brandNames), [brandNames]);

  if (brands.length === 0) return null;

  // Duplicate for seamless looping.
  const loop = [...brands, ...brands];

  // Speed scales with brand count so each card spends roughly the same time
  // on screen regardless of how many brands there are.
  const animationDuration = `${brands.length * 20}s`;

  return (
    <section className="relative w-full bg-surface border-y border-border">
      {/* Eyebrow label */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-14 md:pt-20 pb-8 md:pb-10 flex items-center justify-center gap-4">
        <span className="h-px w-12 md:w-16 bg-border" aria-hidden="true" />
        <p className="text-caption uppercase tracking-[0.22em] text-text-muted">
          {t("brandWall.eyebrow")}
        </p>
        <span className="h-px w-12 md:w-16 bg-border" aria-hidden="true" />
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden pb-14 md:pb-20 group">
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
                    {/* Desktop hover overlay — marquee pauses on hover via the
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
    </section>
  );
}
