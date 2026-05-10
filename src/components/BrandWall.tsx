import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { useBrandList } from "@/hooks/useProducts";
import { brandPath } from "@/utils/slugs";

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

  // Speed scales with brand count so each name spends roughly the same time on screen.
  // Tuned so 8 brands ≈ 160s loop (adjust the multiplier if speed feels off).
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
            <div key={`${name}-${i}`} className="flex items-center shrink-0">
              <Link
                to={href(brandPath(name))}
                className="px-10 md:px-16 text-h3 md:text-h2-md font-light tracking-[0.22em] text-text-muted hover:text-text-strong transition-colors duration-quick ease-default whitespace-nowrap"
              >
                {name.toUpperCase()}
              </Link>
              <span
                className="text-mocha/40 select-none text-h3 md:text-h2-md font-light"
                aria-hidden="true"
              >
                ·
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
