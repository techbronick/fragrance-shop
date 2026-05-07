import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Product } from "@/types/database";
import { NotesSection } from "@/components/product/NotesSection";
import { DetailsSection } from "@/components/product/DetailsSection";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=600&h=600&q=75&fm=webp";

type Props = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductInfoModal({ product, open, onOpenChange }: Props) {
  const { t } = useTranslation("product");

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 bg-paper gap-0 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-10 h-9 w-9 inline-flex items-center justify-center rounded-md bg-paper/80 backdrop-blur-sm text-text hover:bg-surface-2 duration-instant ease-default"
          aria-label={t("image.close")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-white p-6 md:p-8">
            <img
              src={product.image_url || FALLBACK_IMAGE}
              alt={`${product.brand} ${product.name}`}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
            />
          </div>

          {/* Info */}
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <p className="text-caption uppercase tracking-[0.06em] text-text-muted">
                {product.brand}
              </p>
              <h2 className="text-h2 md:text-h2-md font-normal text-text-strong mt-1">
                {product.name}
              </h2>
            </div>

            {product.description && (
              <p className="text-body text-text leading-relaxed">
                {product.description}
              </p>
            )}

            <NotesSection product={product} />

            <DetailsSection product={product} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
