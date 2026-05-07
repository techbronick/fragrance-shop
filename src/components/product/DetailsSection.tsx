import { useTranslation } from "react-i18next";
import { Product } from "@/types/database";
import { Rating } from "@/components/Rating";
import { ExternalLink } from "lucide-react";

type Props = {
  product: Product;
};

function fragranticaUrl(p: Product): string {
  const q = encodeURIComponent(`${p.brand} ${p.name}`);
  return `https://www.fragrantica.com/search/?query=${q}`;
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-baseline gap-6 py-4 border-b border-border">
    <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-32 shrink-0">
      {label}
    </span>
    <div className="flex-1 text-body text-text">{children}</div>
  </div>
);

export function DetailsSection({ product }: Props) {
  const { t } = useTranslation("product");
  const genderLabel = product.gender_neutral ? t('gender.unisex') : t('gender.gendered');
  return (
    <section className="max-w-[720px] mx-auto">
      <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
        {t('details_section.title')}
      </p>
      <div className="space-y-0">
        <Row label={t('details.brand')}>{product.brand}</Row>
        <Row label={t('details.concentration')}>{product.concentration}</Row>
        <Row label={t('details.family')}>{product.family}</Row>
        <Row label={t('details.year')}>{product.launch_year}</Row>
        <Row label={t('details.gender')}>{genderLabel}</Row>
        <Row label={t('details.rating')}>
          <Rating value={product.rating} count={product.review_count} />
        </Row>
      </div>
      <a
        href={fragranticaUrl(product)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text mt-6 duration-instant ease-default"
      >
        {t('details.viewOnFragrantica')} <ExternalLink className="h-3 w-3" />
      </a>
    </section>
  );
}
