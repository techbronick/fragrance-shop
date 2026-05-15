import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import { BrandWall } from "@/components/BrandWall";
import NewArrivalsCarousel from "@/components/NewArrivalsCarousel";
import ClientReviews from "@/components/ClientReviews";
import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import { useNewestProducts } from "@/hooks/useProducts";
import { useSKUsByProductIds } from "@/hooks/useSKUs";
import { useMemo } from "react";
import { PageMeta } from "@/hooks/usePageMeta";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/utils/jsonLd";

const Index = () => {
  const { t, i18n } = useTranslation('home');
  const localizedHref = useLocalizedHref();
  // Fetch only the 8 newest products directly: no client-side sort over
  // 2k+ rows, no companion 14k-SKU pull.
  const { data: newArrivals = [] } = useNewestProducts(8);
  // Batch-fetch the SKUs for those 8 products and hand the map down to the
  // carousel: every ProductCard reads from the prop, so all rows render at
  // the same final height and the carousel doesn't reflow as data streams in.
  const newArrivalIds = useMemo(() => newArrivals.map((p) => p.id), [newArrivals]);
  const { skusByProduct: newArrivalSkus } = useSKUsByProductIds(newArrivalIds);

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
        {newArrivals.length > 0 && (
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
            <NewArrivalsCarousel products={newArrivals} skusByProduct={newArrivalSkus} />
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
      </main>

      <Footer />
    </div>
  );
};

export default Index;
