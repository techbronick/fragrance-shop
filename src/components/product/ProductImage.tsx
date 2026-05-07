import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  fallback?: string;
};

export function ProductImage({ src, alt, fallback }: Props) {
  const { t } = useTranslation("product");
  const [errored, setErrored] = useState(false);
  const [open, setOpen] = useState(false);
  const displaySrc = errored && fallback ? fallback : src;

  return (
    <>
      <button
        type="button"
        onClick={() => !errored && setOpen(true)}
        disabled={errored}
        className="block w-full aspect-[5/4] bg-white p-6 md:p-8 rounded-lg"
        aria-label={t('image.expand')}
      >
        <img
          src={displaySrc}
          alt={alt}
          className="w-full h-full object-contain"
          loading="eager"
          onError={() => setErrored(true)}
        />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(85vw,80vh)] aspect-square p-12 md:p-16 bg-white">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 z-10 h-10 w-10 inline-flex items-center justify-center rounded-md text-text hover:bg-surface-2 duration-instant ease-default"
            aria-label={t('image.close')}
          >
            <X />
          </button>
          <img
            src={displaySrc}
            alt={alt}
            className="w-full h-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
