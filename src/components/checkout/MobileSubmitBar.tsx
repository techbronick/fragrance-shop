import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { formatCheckoutPrice } from "@/utils/formatCheckoutPrice";

type Props = {
  total: number;
  country: string;
  mdlPerEur: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  itemCount: number;
};

export function MobileSubmitBar({
  total,
  country,
  mdlPerEur,
  onSubmit,
  isSubmitting,
  itemCount,
}: Props) {
  const { t: tc } = useTranslation("checkout");

  if (itemCount === 0) return null;

  return (
    <div
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-caption text-text-muted">{tc('summary.total')}</p>
          <p className="text-body text-text-strong">
            {formatCheckoutPrice(total)}
            {country !== 'MD' && (
              <span className="text-caption text-text-muted ml-2">
                ≈ €{(total / 100 / mdlPerEur).toFixed(2)}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? tc('submitting') : tc('submit')}
        </Button>
      </div>
    </div>
  );
}
