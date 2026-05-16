import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo, ReactNode } from "react";
import { useBrandList, useNewestProducts } from "@/hooks/useProducts";
import { usePricedProducts } from "@/hooks/usePricedProducts";
import { useAllSKUs } from "@/hooks/useAllSKUs";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { getCachedBrandImageUrl } from "@/utils/brandImages";
import { brandSlug } from "@/utils/slugs";

export type DestinationTile =
  | "brands"          // Branduri (link to brands view)
  | "products"        // Toate parfumurile (link to shop)
  | "discoverySets"   // Seturi discovery (link to discovery-set builder)
  | "moreFromBrand"   // Mai mult de la {brand} (link to brand page)
  | "newest";         // Cele mai noi (link to /shop?sort=newest)

interface Props {
  // The 3 (or however many) tiles to render, left-to-right.
  tiles: DestinationTile[];
  // Optional: exclude this brand from the brand/product collages so the
  // strip doesn't feel like a repeat of what the user just browsed.
  excludeBrand?: string;
  // Required when `moreFromBrand` is in the tile list.
  brandFocus?: string;
  // Optional: exclude this product id from product collages (use on PDP).
  excludeProductId?: string;
}

// 2x2 image collage that fills the tile. Pads with blank cells if the
// caller couldn't supply four images. `fit="contain"` (for product
// bottles on white) keeps the whole bottle visible with padding;
// `fit="cover"` (for ambient brand images) crops to fill the cell.
function Collage({ urls, fit = "cover" }: { urls: string[]; fit?: "cover" | "contain" }) {
  const cells: (string | null)[] = [
    ...urls.slice(0, 4),
    ...Array(Math.max(0, 4 - urls.length)).fill(null),
  ];
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-full bg-mocha-soft">
      {cells.map((u, i) => (
        <div key={i} className="overflow-hidden bg-white">
          {u && (
            <img
              src={u}
              alt=""
              loading="lazy"
              className={
                "w-full h-full transition-transform duration-slow ease-default group-hover/tile:scale-105 " +
                (fit === "contain" ? "object-contain p-2" : "object-cover")
              }
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
      className="group/tile relative block overflow-hidden rounded-lg border border-border bg-surface aspect-square md:aspect-[4/5] hover:border-mocha/40 hover:shadow-md transition-[border-color,box-shadow] duration-instant ease-default"
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

function shuffleSlice<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

export function ExploreDestinations({
  tiles,
  excludeBrand,
  brandFocus,
  excludeProductId,
}: Props) {
  const { t } = useTranslation("shop");
  const href = useLocalizedHref();
  const { data: brandNames = [] } = useBrandList();
  const { data: products = [] } = usePricedProducts();
  const { data: allSkus = [] } = useAllSKUs();
  const { data: newestProducts = [] } = useNewestProducts(12);

  const stockedProductIds = useMemo(() => {
    const s = new Set<string>();
    for (const sk of allSkus) if (sk.stock > 0 && sk.price > 0) s.add(sk.product_id);
    return s;
  }, [allSkus]);

  const inStockBrands = useMemo(() => {
    const s = new Set<string>();
    for (const p of products) if (stockedProductIds.has(p.id)) s.add(p.brand);
    return s;
  }, [products, stockedProductIds]);

  // brand-collage source: in-stock brands minus the excluded one
  const brandImages = useMemo(() => {
    const pool = brandNames.filter((b) => b !== excludeBrand && inStockBrands.has(b));
    return shuffleSlice(pool, 4).map(getCachedBrandImageUrl);
  }, [brandNames, inStockBrands, excludeBrand]);

  // product-collage source: in-stock priced products from any brand other
  // than the excluded one, with images, minus the excluded product id
  const productImages = useMemo(() => {
    const pool = products.filter(
      (p) =>
        p.brand !== excludeBrand &&
        p.id !== excludeProductId &&
        p.image_url &&
        stockedProductIds.has(p.id),
    );
    return shuffleSlice(pool, 4).map((p) => p.image_url as string);
  }, [products, stockedProductIds, excludeBrand, excludeProductId]);

  // brand-focus collage: products belonging to brandFocus, minus the current
  // product (only used by the `moreFromBrand` tile)
  const brandFocusImages = useMemo(() => {
    if (!brandFocus) return [];
    const pool = products.filter(
      (p) => p.brand === brandFocus && p.id !== excludeProductId && p.image_url,
    );
    return shuffleSlice(pool, 4).map((p) => p.image_url as string);
  }, [products, brandFocus, excludeProductId]);

  // newest collage: most-recent products with images
  const newestImages = useMemo(() => {
    const pool = newestProducts.filter((p) => p.image_url && p.id !== excludeProductId);
    return pool.slice(0, 4).map((p) => p.image_url as string);
  }, [newestProducts, excludeProductId]);

  function renderTile(kind: DestinationTile) {
    switch (kind) {
      case "brands":
        return (
          <Tile
            key="brands"
            href={href("/shop?view=brands")}
            visual={<Collage urls={brandImages} />}
            title={t("destinations.brands.title")}
            body={t("destinations.brands.body")}
          />
        );
      case "products":
        return (
          <Tile
            key="products"
            href={href("/shop")}
            visual={<Collage urls={productImages} fit="contain" />}
            title={t("destinations.products.title")}
            body={t("destinations.products.body")}
          />
        );
      case "discoverySets":
        return (
          <Tile
            key="discoverySets"
            href={href("/discovery-sets/builder")}
            visual={
              <img
                src="/discovery-cta.webp"
                alt=""
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-slow ease-default group-hover/tile:scale-105"
              />
            }
            title={t("destinations.discoverySets.title")}
            body={t("destinations.discoverySets.body")}
          />
        );
      case "moreFromBrand":
        if (!brandFocus) return null;
        return (
          <Tile
            key="moreFromBrand"
            href={href(`/brand/${brandSlug(brandFocus)}`)}
            visual={<Collage urls={brandFocusImages} fit="contain" />}
            title={t("destinations.moreFromBrand.title", { brand: brandFocus })}
            body={t("destinations.moreFromBrand.body")}
          />
        );
      case "newest":
        return (
          <Tile
            key="newest"
            href={href("/shop?sort=newest")}
            visual={<Collage urls={newestImages} fit="contain" />}
            title={t("destinations.newest.title")}
            body={t("destinations.newest.body")}
          />
        );
    }
  }

  const rendered = tiles.map(renderTile).filter(Boolean);
  if (rendered.length === 0) return null;

  return (
    <section className="mt-16 md:mt-24 border-t border-border pt-12 md:pt-16">
      <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6 md:mb-8">
        {t("destinations.eyebrow")}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">{rendered}</div>
    </section>
  );
}
