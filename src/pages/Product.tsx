import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BrandLoader } from "@/components/BrandLoader";
import { useProducts } from "@/hooks/useProducts";
import { useSKUs } from "@/hooks/useSKUs";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { PageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/ProductImage";
import { PurchaseBlock } from "@/components/product/PurchaseBlock";
import { MobileBuyBar } from "@/components/product/MobileBuyBar";
import { NotesSection } from "@/components/product/NotesSection";
import { DetailsSection } from "@/components/product/DetailsSection";
import { ExploreDestinations } from "@/components/explore/ExploreDestinations";
import { SKU } from "@/types/database";
import { findProductByPath, productPath, UUID_RE, brandSlug, productSlug } from "@/utils/slugs";
import { JsonLd } from "@/components/JsonLd";
import { productJsonLd, breadcrumbJsonLd } from "@/utils/jsonLd";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=600&h=600&q=75&fm=webp";

const Product = () => {
  const { idOrBrandSlug, brandSlugParam, productSlugParam } = useParams<{
    idOrBrandSlug?: string;
    brandSlugParam?: string;
    productSlugParam?: string;
  }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("common");
  const { t: tP } = useTranslation("product");
  const href = useLocalizedHref();
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();

  useEffect(() => {
    if (idOrBrandSlug && UUID_RE.test(idOrBrandSlug) && allProducts.length > 0) {
      const found = allProducts.find((p) => p.id === idOrBrandSlug);
      if (found) navigate(href(productPath(found)), { replace: true });
    }
  }, [idOrBrandSlug, allProducts, navigate, href]);

  const product =
    brandSlugParam && productSlugParam
      ? findProductByPath(allProducts, brandSlugParam, productSlugParam)
      : null;

  // While the UUID redirect is pending (legacy URL → slug URL), keep the loader
  // visible so the user doesn't see a one-frame flash of PdpNotFound.
  const pendingUuidRedirect =
    !!idOrBrandSlug &&
    UUID_RE.test(idOrBrandSlug) &&
    allProducts.some((p) => p.id === idOrBrandSlug);

  const { data: skus = [], isLoading: skusLoading } = useSKUs(product?.id || "");
  const [selectedSku, setSelectedSku] = useState<SKU | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { toast } = useToast();
  const inlinePurchaseRef = useRef<HTMLDivElement>(null);

  // Default selection: smallest available SKU. Set once SKUs load.
  useEffect(() => {
    if (!selectedSku && skus.length > 0) {
      const sorted = [...skus].sort((a, b) => a.size_ml - b.size_ml);
      setSelectedSku(sorted[0]);
    }
  }, [skus, selectedSku]);

  if (productsLoading || skusLoading || pendingUuidRedirect) {
    return <BrandLoader />;
  }

  if (!product) {
    return <PdpNotFound onBack={() => navigate(href('/shop'))} />;
  }

  const handleAddToCart = () => {
    if (!selectedSku) return;
    addItem({
      id: product.id,
      type: 'product',
      name: product.name,
      brand: product.brand,
      quantity,
      price: Math.round(selectedSku.price / 100), // bani -> Lei
      sizeLabel: `${selectedSku.size_ml}ml`,
      image: product.image_url,
      skuId: selectedSku.id,
    });
    toast({
      title: t('toast.addedToCart'),
      description: `${product.name} · ${selectedSku.size_ml}ml`,
      action: (
        <ToastAction
          altText={t('toast.goToCheckout')}
          onClick={() => navigate(href('/checkout'))}
        >
          {t('toast.goToCheckout')}
        </ToastAction>
      ),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="product"
        titleKey="meta.title"
        descriptionKey="meta.description"
        values={{ name: product.name, brand: product.brand }}
      />
      <JsonLd payload={productJsonLd(product, skus, i18n.language)} />
      <JsonLd payload={breadcrumbJsonLd([
        { name: t("breadcrumb.home"), url: `https://modestshop.md/${i18n.language}` },
        { name: t("breadcrumb.shop"), url: `https://modestshop.md/${i18n.language}/shop` },
        { name: product.brand, url: `https://modestshop.md/${i18n.language}/brand/${brandSlug(product.brand)}` },
        { name: product.name, url: `https://modestshop.md/${i18n.language}/product/${brandSlug(product.brand)}/${productSlug(product.name)}` },
      ])} />
      <Header />

      <main className="flex-1">
        {/* Above the fold: 12-col grid, image cols 1–6, purchase cols 7–12 */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-6">
            <ProductImage
              src={product.image_url}
              alt={`${product.brand} ${product.name}`}
              fallback={FALLBACK_IMAGE}
            />
          </div>
          <div
            ref={inlinePurchaseRef}
            className="md:col-span-6 md:sticky md:top-24 md:self-start"
          >
            <PurchaseBlock
              product={product}
              skus={skus}
              selectedSku={selectedSku}
              onSizeChange={setSelectedSku}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>

        {/* Below the fold: 720px column with 64px section gap */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-24 md:pb-32 space-y-16">
          <NotesSection product={product} />
          <DetailsSection product={product} />
          <ExploreDestinations
            tiles={["moreFromBrand", "brands", "discoverySets"]}
            brandFocus={product.brand}
            excludeProductId={product.id}
          />
        </div>
      </main>

      <Footer />

      <MobileBuyBar
        selectedSku={selectedSku}
        quantity={quantity}
        onAddToCart={handleAddToCart}
        watchRef={inlinePurchaseRef}
      />
    </div>
  );
};

const PdpSkeleton = () => (
  <div className="min-h-screen flex flex-col bg-paper">
    <Header />
    <main className="flex-1 max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 w-full">
      <div className="md:col-span-7">
        <div className="aspect-square bg-surface-2 rounded-md animate-shimmer skeleton-shimmer" />
      </div>
      <div className="md:col-span-5 space-y-6">
        <div className="h-4 w-24 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
        <div className="h-8 w-3/4 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
        <div className="h-4 w-full bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
        <div className="flex gap-2">
          <div className="h-10 w-16 bg-surface-2 animate-shimmer skeleton-shimmer rounded-pill" />
          <div className="h-10 w-16 bg-surface-2 animate-shimmer skeleton-shimmer rounded-pill" />
          <div className="h-10 w-16 bg-surface-2 animate-shimmer skeleton-shimmer rounded-pill" />
        </div>
        <div className="h-8 w-32 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
        <div className="h-12 w-full bg-surface-2 animate-shimmer skeleton-shimmer rounded-md" />
      </div>
    </main>
    <Footer />
  </div>
);

const PdpNotFound = ({ onBack }: { onBack: () => void }) => {
  const { t: tP } = useTranslation("product");
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-4">
            {tP('notFound.title')}
          </h1>
          <p className="text-body text-text-muted mb-8">
            {tP('notFound.description')}
          </p>
          <Button variant="ghost" onClick={onBack}>
            {tP('notFound.back')}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Product;
