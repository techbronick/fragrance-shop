import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/hooks/usePageMeta";
import { BrandLoader } from "@/components/BrandLoader";
import { usePricedProducts } from "@/hooks/usePricedProducts";
import { useAllSKUs, buildMinPriceMap, buildInStockMap, buildSkusByProductMap } from "@/hooks/useAllSKUs";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { ProductsView } from "@/components/shop/ProductsView";
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
  const { data: allSkus = [], isLoading: skusLoading } = useAllSKUs();

  if (productsLoading || skusLoading) return <BrandLoader />;

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
            filters={{ brand: [brandName], family: [], gender: "all", inStock: false }}
            onFiltersChange={() => {}}
            sort="featured"
            onSortChange={() => {}}
            query=""
            onQueryChange={() => {}}
            priceByProduct={priceByProduct}
            inStockByProduct={inStockByProduct}
            skusByProduct={skusByProduct}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Brand;
