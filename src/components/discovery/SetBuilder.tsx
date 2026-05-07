import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingBag } from "lucide-react";
import { usePricedProducts } from "@/hooks/usePricedProducts";
import { useAllSKUs, buildMinPriceMap } from "@/hooks/useAllSKUs";
import { useDiscoverySetConfigs } from "@/hooks/useDiscoverySets";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { formatPrice } from "@/utils/formatPrice";
import { SetCatalogPane } from "@/components/discovery/SetCatalogPane";
import { SetTray } from "@/components/discovery/SetTray";

type Size = number;

export function SetBuilder() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { t: tD } = useTranslation("discovery");
  const href = useLocalizedHref();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products = [] } = usePricedProducts();
  const { data: allSkus = [] } = useAllSKUs();
  const priceByProduct = useMemo(() => buildMinPriceMap(allSkus), [allSkus]);
  const { data: configs = [] } = useDiscoverySetConfigs();
  const { addItem } = useCart();
  const { toast } = useToast();

  const customizableConfigs = useMemo(
    () =>
      configs
        .filter(c => c.is_customizable)
        .sort((a, b) =>
          a.total_slots !== b.total_slots
            ? a.total_slots - b.total_slots
            : a.volume_ml - b.volume_ml,
        ),
    [configs],
  );
  const validSizes = useMemo(
    () => Array.from(new Set(customizableConfigs.map(c => c.total_slots))),
    [customizableConfigs],
  );
  const initialSize: Size = (() => {
    const s = parseInt(searchParams.get('size') || '', 10);
    return validSizes.includes(s) ? s : (validSizes[0] ?? 5);
  })();

  const [totalSlots, setTotalSlots] = useState<Size>(initialSize);

  // Volumes available for the current totalSlots, in ascending order.
  const volumesForCurrentSize = useMemo(
    () =>
      Array.from(
        new Set(
          customizableConfigs
            .filter(c => c.total_slots === totalSlots)
            .map(c => c.volume_ml),
        ),
      ).sort((a, b) => a - b),
    [customizableConfigs, totalSlots],
  );

  const initialVolume: number = (() => {
    const v = parseInt(searchParams.get('volume') || '', 10);
    return volumesForCurrentSize.includes(v) ? v : (volumesForCurrentSize[0] ?? 0);
  })();

  const [volumeMl, setVolumeMl] = useState<number>(initialVolume);

  // Snap volume to the first available value when the slot count changes
  // (or when configs load) and the current volume isn't valid for the new size.
  useEffect(() => {
    if (volumesForCurrentSize.length > 0 && !volumesForCurrentSize.includes(volumeMl)) {
      setVolumeMl(volumesForCurrentSize[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumesForCurrentSize]);

  // If validSizes loads after first render and the current totalSlots isn't valid,
  // snap to the first available size.
  useEffect(() => {
    if (validSizes.length > 0 && !validSizes.includes(totalSlots)) {
      setTotalSlots(validSizes[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validSizes]);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const prefill = searchParams.get('prefill');
    return prefill ? prefill.split(',').filter(Boolean).slice(0, initialSize) : [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    const defaultSize = validSizes[0];
    const defaultVolume = volumesForCurrentSize[0];

    if (defaultSize !== undefined && totalSlots !== defaultSize) {
      next.set('size', String(totalSlots));
    } else {
      next.delete('size');
    }

    if (defaultVolume !== undefined && volumeMl !== defaultVolume) {
      next.set('volume', String(volumeMl));
    } else {
      next.delete('volume');
    }

    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlots, volumeMl, validSizes, volumesForCurrentSize]);

  useEffect(() => {
    if (selectedIds.length > totalSlots) {
      const removedCount = selectedIds.length - totalSlots;
      setSelectedIds(prev => prev.slice(0, totalSlots));
      toast({
        title: t('toast.samplesRemoved', { count: removedCount }),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSlots]);

  const productIndex = useMemo(() => {
    return new Map(products.map(p => [p.id, p]));
  }, [products]);

  const selected = useMemo(
    () => selectedIds.map(id => productIndex.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [selectedIds, productIndex]
  );

  const customizableConfig = useMemo(
    () =>
      customizableConfigs.find(
        c => c.total_slots === totalSlots && c.volume_ml === volumeMl,
      ),
    [customizableConfigs, totalSlots, volumeMl]
  );

  const subtotal = customizableConfig ? customizableConfig.base_price : 0;

  const toggleProduct = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= totalSlots) return prev;
      return [...prev, id];
    });
  };

  const removeProduct = (id: string) => {
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  const handleAddToCart = () => {
    if (!customizableConfig || selectedIds.length === 0) return;
    setIsAdding(true);
    addItem({
      id: `custom-${Date.now()}`,
      type: 'custom-bundle',
      configId: customizableConfig.id,
      name: t('cart.customBundleName', { count: totalSlots }),
      quantity: 1,
      price: Math.round(customizableConfig.base_price / 100),
      image: customizableConfig.image_url || undefined,
      selectedItems: selectedIds.map((productId, i) => ({
        slot_index: i,
        sku_id: productId,
      })),
    });
    toast({ title: t('toast.setAddedToCart') });
    navigate(href('/checkout'));
    setIsAdding(false);
  };

  return (
    <div>
      <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">
        {tD('builder.title')}
      </h1>
      <p className="text-body text-text-muted mt-2 mb-8">
        {tD('builder.subtitle', { count: totalSlots })}
      </p>

      {validSizes.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-caption uppercase tracking-[0.06em] text-text-muted sm:w-24 sm:shrink-0">{tD('builder.size')}</span>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {validSizes.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setTotalSlots(s)}
                className={
                  "rounded-pill px-3 sm:px-4 py-2 text-body border duration-instant ease-default " +
                  (totalSlots === s
                    ? "bg-mocha text-paper border-mocha"
                    : "bg-surface text-text border-border hover:bg-surface-2")
                }
              >
                {tD('builder.sizeOption', { count: s })}
              </button>
            ))}
          </div>
        </div>
      )}

      {volumesForCurrentSize.length > 1 && (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-caption uppercase tracking-[0.06em] text-text-muted sm:w-24 sm:shrink-0">{tD('builder.volume')}</span>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {volumesForCurrentSize.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setVolumeMl(v)}
                className={
                  "rounded-pill px-3 sm:px-4 py-2 text-body border duration-instant ease-default " +
                  (volumeMl === v
                    ? "bg-mocha text-paper border-mocha"
                    : "bg-surface text-text border-border hover:bg-surface-2")
                }
              >
                {v} ml
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
        <div className="min-w-0">
          <SetCatalogPane
            products={products}
            priceByProduct={priceByProduct}
            selectedIds={new Set(selectedIds)}
            onToggle={toggleProduct}
            canAddMore={selectedIds.length < totalSlots}
          />
        </div>
        <div className="hidden lg:block">
          <div className="lg:sticky lg:top-24">
            <SetTray
              selected={selected}
              totalSlots={totalSlots}
              subtotal={subtotal}
              onRemove={removeProduct}
              onAddToCart={handleAddToCart}
              isAdding={isAdding}
            />
          </div>
        </div>
      </div>

      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-border shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.18)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between text-caption text-text-muted mb-1.5">
            <span className="uppercase tracking-[0.06em]">
              {selectedIds.length} / {totalSlots}
            </span>
            <span className="text-text-strong text-body font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="h-1 w-full bg-surface-2 rounded-pill overflow-hidden">
            <div
              className="h-full bg-mocha transition-[width] duration-default ease-default"
              style={{ width: `${Math.min(100, (selectedIds.length / Math.max(totalSlots, 1)) * 100)}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTrayOpen(true)}
          className="w-full mx-0 mt-2 mb-3 px-4 flex items-center justify-center gap-3 bg-mocha hover:bg-mocha-hover text-paper py-3.5 text-body font-medium rounded-none"
        >
          <span className="relative inline-flex items-center justify-center h-9 w-9 rounded-full bg-paper/15 ring-1 ring-paper/30">
            <ShoppingBag className="h-5 w-5" strokeWidth={2.25} />
            {selectedIds.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-paper text-mocha text-[0.65rem] font-semibold inline-flex items-center justify-center leading-none">
                {selectedIds.length}
              </span>
            )}
          </span>
          <span className="text-body-lg font-medium tracking-[0.01em]">{tD('builder.viewSet')}</span>
        </button>
      </div>

      <Sheet open={trayOpen} onOpenChange={setTrayOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[380px] bg-surface p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <SheetTitle className="text-h2 font-medium text-text-strong">{tD('builder.slotsLabel')}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <SetTray
              selected={selected}
              totalSlots={totalSlots}
              subtotal={subtotal}
              onRemove={removeProduct}
              onAddToCart={() => {
                setTrayOpen(false);
                handleAddToCart();
              }}
              isAdding={isAdding}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
