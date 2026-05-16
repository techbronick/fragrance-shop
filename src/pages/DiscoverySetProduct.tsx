import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BrandLoader } from "@/components/BrandLoader";
import { PageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { useDiscoverySetConfigsWithItems } from "@/hooks/useDiscoverySets";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { ProductImage } from "@/components/product/ProductImage";
import { SetPurchaseBlock } from "@/components/discovery/SetPurchaseBlock";
import { SetMobileBuyBar } from "@/components/discovery/SetMobileBuyBar";
import { ProductInfoModal } from "@/components/discovery/ProductInfoModal";
import { ExploreDestinations } from "@/components/explore/ExploreDestinations";
import { findSetBySlug, setPath, UUID_RE } from "@/utils/slugs";
import type { Product } from "@/types/database";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=600&h=600&q=75&fm=webp";

const DiscoverySetProduct = () => {
  const { slugOrId } = useParams<{ slugOrId?: string }>();
  const navigate = useNavigate();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("discovery");
  const href = useLocalizedHref();
  const { data: allConfigs = [], isLoading: configsLoading } = useDiscoverySetConfigsWithItems();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const { addItem } = useCart();
  const { toast } = useToast();
  const inlinePurchaseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slugOrId && UUID_RE.test(slugOrId) && allConfigs.length > 0) {
      const found = allConfigs.find((c) => c.id === slugOrId);
      if (found) navigate(href(setPath(found)), { replace: true });
    }
  }, [slugOrId, allConfigs, navigate, href]);

  const config = slugOrId ? findSetBySlug(allConfigs, slugOrId) : null;

  // Keep the loader up while a UUID-to-slug redirect is pending so users
  // don't see a one-frame flash of the not-found state.
  const pendingUuidRedirect =
    !!slugOrId &&
    UUID_RE.test(slugOrId) &&
    allConfigs.some((c) => c.id === slugOrId);

  if (configsLoading || pendingUuidRedirect) {
    return <BrandLoader />;
  }

  if (!config) {
    return (
      <div className="min-h-screen flex flex-col bg-paper">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-h1 md:text-h1-md font-normal text-text-strong mb-4">
              {t('set.unavailable')}
            </h1>
            <Button variant="ghost" onClick={() => navigate(href('/discovery-sets'))}>
              {t('set.backToSets')}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: `predefined-${config.id}`,
      type: 'predefined-bundle',
      configId: config.id,
      name: config.name,
      quantity,
      price: Math.round(config.base_price / 100),
      image: config.image_url || undefined,
    });
    toast({
      title: tCommon('toast.addedToCart'),
      description: config.name,
      action: (
        <ToastAction
          altText={tCommon('toast.goToCheckout')}
          onClick={() => navigate(href('/checkout'))}
        >
          {tCommon('toast.goToCheckout')}
        </ToastAction>
      ),
    });
    setIsAdding(false);
  };

  const items: Array<{ slot_index: number; sku?: { product?: Product } }> =
    (config as any).items || [];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="discovery"
        titleKey="metaSet.title"
        descriptionKey="metaSet.description"
        values={{ name: config.name }}
      />
      <Header />

      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-7">
            <ProductImage
              src={config.image_url || FALLBACK_IMAGE}
              alt={config.name}
              fallback={FALLBACK_IMAGE}
            />
          </div>
          <div
            ref={inlinePurchaseRef}
            className="md:col-span-5 md:sticky md:top-24 md:self-start"
          >
            <SetPurchaseBlock
              config={config}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              isAdding={isAdding}
            />
          </div>
        </div>

        {items.length > 0 && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-24 md:pb-32">
            <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
              {t('set.contents')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((item, idx) => {
                const product = item.sku?.product;
                const imgSrc = product?.image_url || FALLBACK_IMAGE;
                const slotNumber = (item.slot_index ?? idx) + 1;
                return (
                  <button
                    key={item.slot_index ?? idx}
                    type="button"
                    onClick={() => product && setActiveProduct(product)}
                    disabled={!product}
                    className="group relative text-left bg-surface border border-border rounded-lg transition-[transform,box-shadow] duration-slow ease-default hover:scale-[1.015] hover:shadow-md will-change-transform disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <span className="absolute top-2 left-2 z-10 h-7 min-w-[1.75rem] px-2 inline-flex items-center justify-center rounded-pill bg-mocha text-paper text-caption font-medium">
                      {slotNumber}
                    </span>
                    <div className="aspect-square bg-white p-[12%] rounded-t-lg">
                      <img
                        src={imgSrc}
                        alt={product?.name || ''}
                        className="w-full h-full object-contain transition-transform duration-slow ease-default group-hover:scale-105 will-change-transform"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-caption text-text-muted truncate">{product?.brand || ''}</p>
                      <p className="text-body text-text-strong truncate">{product?.name || ''}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-24 md:pb-32">
          <ExploreDestinations tiles={["brands", "products", "newest"]} />
        </div>
      </main>

      <Footer />

      <SetMobileBuyBar
        config={config}
        quantity={quantity}
        onAddToCart={handleAddToCart}
        watchRef={inlinePurchaseRef}
      />

      <ProductInfoModal
        product={activeProduct}
        open={activeProduct !== null}
        onOpenChange={(o) => !o && setActiveProduct(null)}
      />
    </div>
  );
};

export default DiscoverySetProduct;
