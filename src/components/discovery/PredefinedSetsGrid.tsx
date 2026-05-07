import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { DiscoverySetConfig } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";
import { setPath } from "@/utils/slugs";

type Props = {
  sets: DiscoverySetConfig[];
  isLoading?: boolean;
};

export function PredefinedSetsGrid({ sets, isLoading }: Props) {
  const { t } = useTranslation("discovery");
  const href = useLocalizedHref();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-md overflow-hidden">
            <div className="aspect-square bg-surface-2 animate-shimmer skeleton-shimmer" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-2/3 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
              <div className="h-3 w-1/2 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
              <div className="h-4 w-1/3 bg-surface-2 animate-shimmer skeleton-shimmer rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <p className="text-h3 font-medium text-text-strong text-center py-16">
        {t('predefined.empty')}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {sets.map(set => (
        <a
          key={set.id}
          href={href(setPath(set))}
          className="group block bg-surface border border-border rounded-lg overflow-hidden transition-[transform,box-shadow] duration-slow ease-default hover:scale-[1.015] hover:shadow-md will-change-transform"
        >
          <div className="aspect-square bg-surface-2 overflow-hidden">
            {set.image_url && (
              <img
                src={set.image_url}
                alt={set.name}
                className="w-full h-full object-cover transition-transform duration-slow ease-default group-hover:scale-105 will-change-transform"
                loading="lazy"
              />
            )}
          </div>
          <div className="p-4 space-y-1">
            <p className="text-body text-text-strong">{set.name}</p>
            <p className="text-caption text-text-muted">
              {set.total_slots} {t('predefined.sample', { count: set.total_slots })} · {set.volume_ml}ml
            </p>
            <p className="text-body text-text">{formatPrice(set.base_price)}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
