import { useTranslation } from "react-i18next";
import { Product } from "@/types/database";

type Props = {
  product: Product;
};

export function NotesSection({ product }: Props) {
  const { t } = useTranslation("product");
  const hasAny =
    (product.notes_top && product.notes_top.length > 0) ||
    (product.notes_mid && product.notes_mid.length > 0) ||
    (product.notes_base && product.notes_base.length > 0);

  if (!hasAny) return null;

  return (
    <section className="max-w-[720px] mx-auto">
      <p className="text-caption uppercase tracking-[0.06em] text-text-muted mb-6">
        {t('notes.title')}
      </p>
      <div className="space-y-0">
        {product.notes_top && product.notes_top.length > 0 && (
          <div className="flex items-baseline gap-6 py-4 border-b border-border">
            <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-20 shrink-0">
              {t('notes.top')}
            </span>
            <span className="text-body text-text">{product.notes_top.join(', ')}</span>
          </div>
        )}
        {product.notes_mid && product.notes_mid.length > 0 && (
          <div className="flex items-baseline gap-6 py-4 border-b border-border">
            <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-20 shrink-0">
              {t('notes.heart')}
            </span>
            <span className="text-body text-text">{product.notes_mid.join(', ')}</span>
          </div>
        )}
        {product.notes_base && product.notes_base.length > 0 && (
          <div className="flex items-baseline gap-6 py-4">
            <span className="text-caption uppercase tracking-[0.06em] text-text-muted w-20 shrink-0">
              {t('notes.base')}
            </span>
            <span className="text-body text-text">{product.notes_base.join(', ')}</span>
          </div>
        )}
      </div>
    </section>
  );
}
