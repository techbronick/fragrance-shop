import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import { BrandWall } from "@/components/BrandWall";
import NewArrivalsCarousel from "@/components/NewArrivalsCarousel";
import ClientReviews from "@/components/ClientReviews";
import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import { ExploreDestinations } from "@/components/explore/ExploreDestinations";
import { usePricedProducts } from "@/hooks/usePricedProducts";
import { useAllSKUs, buildInStockMap, buildSkusByProductMap } from "@/hooks/useAllSKUs";
import { useMemo } from "react";
import { PageMeta } from "@/hooks/usePageMeta";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/utils/jsonLd";

const Index = () => {
  const { t, i18n } = useTranslation('home');
  const localizedHref = useLocalizedHref();
  // "Noutăți" should only ever show products you can actually buy
  // (stock > 0 AND price > 0), spread across different brands and
  // shuffled, rather than the literal newest rows (which are mostly
  // "La comandă" right now). Both queries are cached app-wide so the
  // BrandWall above warms them.
  const { data: pricedProducts = [], isLoading: pricedLoading } = usePricedProducts();
  const { data: allSkus = [] } = useAllSKUs();
  const newArrivalSkus = useMemo(() => buildSkusByProductMap(allSkus), [allSkus]);

  const sortedNewArrivals = useMemo(() => {
    const inStockMap = buildInStockMap(allSkus); // requires stock>0 && price>0
    const buyable = pricedProducts.filter((p) => inStockMap.get(p.id));
    if (buyable.length === 0) return [];

    // Group buyable products by brand, shuffle within each brand and the
    // brand order, then round-robin pick so the carousel leads with a
    // diverse set of houses instead of 8 of the same brand.
    const byBrand = new Map<string, typeof buyable>();
    for (const p of buyable) {
      const arr = byBrand.get(p.brand);
      if (arr) arr.push(p);
      else byBrand.set(p.brand, [p]);
    }
    const shuffle = <T,>(a: T[]): T[] => {
      const out = [...a];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    };
    const brands = shuffle([...byBrand.keys()]);
    const pools = brands.map((b) => shuffle(byBrand.get(b)!));
    const picked: typeof buyable = [];
    let added = true;
    while (added && picked.length < 12) {
      added = false;
      for (const pool of pools) {
        const next = pool.shift();
        if (next) { picked.push(next); added = true; }
        if (picked.length >= 12) break;
      }
    }
    return picked;
  }, [pricedProducts, allSkus]);

  const newArrivalsLoading = pricedLoading;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="home"
        titleKey="meta.title"
        descriptionKey="meta.description"
      />
      <JsonLd payload={organizationJsonLd(i18n.language)} />
      <JsonLd payload={websiteJsonLd(i18n.language)} />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <HeroSection />

        {/* Brand wall */}
        <BrandWall />

        {/* New Arrivals */}
        {(newArrivalsLoading || sortedNewArrivals.length > 0) && (
          <section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mt-16 md:mt-24 mb-16 md:mb-24">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-caption uppercase tracking-[0.06em] text-text-muted font-normal m-0">
                {t('newArrivals.title')}
              </h2>
              <Link
                to={localizedHref('/shop?sort=newest')}
                className="text-caption text-text-muted hover:text-text duration-instant ease-default"
              >
                {t('newArrivals.viewAll')}
              </Link>
            </div>
            <NewArrivalsCarousel
              products={sortedNewArrivals}
              skusByProduct={newArrivalSkus}
              isLoading={newArrivalsLoading}
            />
          </section>
        )}

        {/* Discovery CTA */}
        <DiscoveryCTA />

        {/* Reviews */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mb-16 md:mb-24">
          <h2 className="text-caption uppercase tracking-[0.06em] text-text-muted font-normal m-0 mb-8">
            {t('reviews.title')}
          </h2>
          <ClientReviews />
        </section>

        {/* Explore destinations */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mb-16 md:mb-24">
          <ExploreDestinations tiles={["brands", "products", "discoverySets"]} />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
