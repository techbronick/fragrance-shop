import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo, ReactNode } from "react";
import { useBrandList } from "@/hooks/useProducts";
import { usePricedProducts } from "@/hooks/usePricedProducts";
import { useAllSKUs } from "@/hooks/useAllSKUs";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { getCachedBrandImageUrl } from "@/utils/brandImages";

interface Props {
  currentBrand: string;
}

// Renders four images in a 2x2 grid, padding with blank cells if the
// caller couldn't supply four. The collage takes the full tile and the
// text gradient sits on top.
function Collage({ urls }: { urls: string[] }) {
  const cells: (string | null)[] = [
    ...urls.slice(0, 4),
    ...Array(Math.max(0, 4 - urls.length)).fill(null),
  ];
  return (
    <div className="grid grid-cols-2 gap-0.5 w-full h-full bg-mocha-soft">
      {cells.map((u, i) => (
        <div key={i} className="aspect-square overflow-hidden bg-white">
          {u && (
            <img
              src={u}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-slow ease-default group-hover/tile:scale-105"
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface TileProps {
  href: string;
  visual: ReactNode;
  title: string;
  body: string;
}

function Tile({ href, visual, title, body }: TileProps) {
  return (
    <Link
      to={href}
      className="group/tile relative block overflow-hidden rounded-lg border border-border bg-surface aspect-[4/5] hover:border-mocha/40 hover:shadow-md transition-[border-color,box-shadow] duration-instant ease-default"
    >
      <div className="absolute inset-0">{visual}</div>
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 bg-gradient-to-t from-black/75 via-black/40 to-transparent text-white">
        <h3 className="text-h2 font-normal leading-tight">{title}</h3>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-caption opacity-85 flex-1 min-w-0">{body}</p>
          <ArrowRight className="h-4 w-4 shrink-0 group-hover/tile:translate-x-0.5 transition-transform duration-instant ease-default" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

export function BrandPageDestinations({ currentBrand }: Props) {
  const { t } = useTranslation("shop");
  const href = useLocalizedHref();
  const { data: brandNames = [] } = useBrandList();
  const { data: products = [] } = usePricedProducts();
  const { data: allSkus = [] } = useAllSKUs();

  // For the brand collage: in-stock brands minus the one the user is
  // already on. We sample so repeat visits to different brand pages
  // surface a different selection without re-fetching.
  const otherBrandImages = useMemo(() => {
    const stockedIds = new Set<string>();
    for (const s of allSkus) if (s.stock > 0 && s.price > 0) stockedIds.add(s.product_id);
    const inStockBrands = new Set<string>();
    for (const p of products) if (stockedIds.has(p.id)) inStockBrands.add(p.brand);
    const pool = brandNames.filter((b) => b !== currentBrand && inStockBrands.has(b));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4).map(getCachedBrandImageUrl);
  }, [brandNames, products, allSkus, currentBrand]);

  // For the all-products collage: random in-stock products with images
  // from brands other than the current one, so the strip reads as
  // discovery rather than a repeat of what the user just scrolled past.
  const otherProductImages = useMemo(() => {
    const stockedIds = new Set<string>();
    for (const s of allSkus) if (s.stock > 0 && s.price > 0) stockedIds.add(s.product_id);
    const pool = products.filter((p) => p.brand !== currentBrand && p.image_url && stockedIds.has(p.id));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4).map((p) => p.image_url as string);
  }, [products, allSkus, currentBrand]);

  return (
    <section className="mt-16 md:mt-24 border-t border-border pt-12 md:pt-16">
      <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6 md:mb-8">
        {t("brand.destinations.eyebrow")}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Tile
          href={href("/shop?view=brands")}
          visual={<Collage urls={otherBrandImages} />}
          title={t("brand.destinations.similarBrands.title")}
          body={t("brand.destinations.similarBrands.body")}
        />
        <Tile
          href={href("/shop")}
          visual={<Collage urls={otherProductImages} />}
          title={t("brand.destinations.allProducts.title")}
          body={t("brand.destinations.allProducts.body")}
        />
        <Tile
          href={href("/discovery-sets/builder")}
          visual={
            <img
              src="/discovery-cta.webp"
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-slow ease-default group-hover/tile:scale-105"
            />
          }
          title={t("brand.destinations.discoverySets.title")}
          body={t("brand.destinations.discoverySets.body")}
        />
      </div>
    </section>
  );
}
