import { useTranslation } from "react-i18next";

type Props = {
  value: number;        // e.g. 4.6
  count: number;        // e.g. 38
  className?: string;
};

export function Rating({ value, count, className }: Props) {
  const { t } = useTranslation("product");
  return (
    <div className={`flex items-baseline gap-2 ${className ?? ''}`}>
      <span className="text-body text-text">
        {value.toFixed(1)} / 5
      </span>
      <span className="text-caption text-text-muted">
        ({count} {t('rating.review', { count })})
      </span>
    </div>
  );
}
