import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSessionState } from "@/hooks/useSessionState";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/hooks/usePageMeta";
import { BrandLoader } from "@/components/BrandLoader";
import { usePricedProducts } from "@/hooks/usePricedProducts";
import { useAllSKUs, buildMinPriceMap, buildInStockMap, buildSkusByProductMap } from "@/hooks/useAllSKUs";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { ProductsView, SortKey } from "@/components/shop/ProductsView";
import { Filters, EMPTY_FILTERS } from "@/components/shop/FilterSidebar";
import { ExploreDestinations } from "@/components/explore/ExploreDestinations";
import { brandSlug } from "@/utils/slugs";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/utils/jsonLd";

const Brand = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const href = useLocalizedHref();
  const { t } = useTranslation("shop");
  const { t: tCommon, i18n } = useTranslation("common");
  const { data: products = [], isLoading: productsLoading } = usePricedProducts();
  const { data: allSkus = [] } = useAllSKUs();

  // Live filter / sort / search state so the toolbar actually works on the
  // brand page (it was wired to no-op handlers before). State is keyed per
  // history entry via useSessionState so a user who scrolls / filters,
  // opens a product, then hits Back lands on the same view they left.
  const location = useLocation();
  const [filters, setFilters] = useSessionState<Filters>(`brand:${location.key}:filters`, EMPTY_FILTERS);
  const [sort, setSort] = useSessionState<SortKey>(`brand:${location.key}:sort`, "featured");
  const [query, setQuery] = useSessionState<string>(`brand:${location.key}:query`, "");

  // Render as soon as products land; SKU-derived data (price, stock) hydrates
  // on the next tick.
  if (productsLoading) return <BrandLoader />;

  const brandProducts = products.filter((p) => brandSlug(p.brand) === slug);
  if (brandProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-4">
              {t("brand.notFound")}
            </h1>
            <Button variant="ghost" onClick={() => navigate(href("/shop"))}>{t("brand.back")}</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const brandName = brandProducts[0].brand;
  const priceByProduct = buildMinPriceMap(allSkus);
  const inStockByProduct = buildInStockMap(allSkus);
  const skusByProduct = buildSkusByProductMap(allSkus);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta namespace="shop" titleKey="brand.metaTitle" descriptionKey="brand.metaDescription" values={{ brand: brandName }} />
      <JsonLd payload={breadcrumbJsonLd([
        { name: tCommon("breadcrumb.home"), url: `https://modestshop.md/${i18n.language}` },
        { name: tCommon("breadcrumb.shop"), url: `https://modestshop.md/${i18n.language}/shop` },
        { name: brandName, url: `https://modestshop.md/${i18n.language}/brand/${brandSlug(brandName)}` },
      ])} />
      <JsonLd payload={itemListJsonLd(brandProducts, i18n.language)} />
      <Header />
      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12">
          <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-2">{t("brand.eyebrow")}</p>
          <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">{brandName}</h1>
          <p className="text-caption text-text-muted mt-1 mb-8">{t("count.products", { count: brandProducts.length })}</p>
          <ProductsView
            products={brandProducts}
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
          <ExploreDestinations
            tiles={["brands", "products", "discoverySets"]}
            excludeBrand={brandName}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Brand;
