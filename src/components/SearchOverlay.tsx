import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, X } from "lucide-react";
import { usePricedProducts } from "@/hooks/usePricedProducts";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { productPath } from "@/utils/slugs";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchOverlay({ open, onOpenChange }: Props) {
  const { t } = useTranslation("common");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const href = useLocalizedHref();
  const { data: products = [] } = usePricedProducts();

  useEffect(() => {
    if (open) {
      const timerId = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timerId);
    } else {
      setQuery("");
    }
  }, [open]);

  const results = query.trim().length >= 2
    ? products
        .filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
    : [];

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length === 0) return;
    onOpenChange(false);
    navigate(href(`/shop?q=${encodeURIComponent(query.trim())}`));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[600px] p-0 gap-0 bg-surface"
      >
        <form onSubmit={submit} className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <Search className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="flex-1 bg-transparent outline-none text-body text-text placeholder:text-text-faint"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-text-muted hover:text-text duration-instant ease-default"
            aria-label={t("search.close")}
          >
            <X />
          </button>
        </form>

        {results.length > 0 && (
          <ul className="max-h-[60vh] overflow-y-auto py-2">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    navigate(href(productPath(p)));
                  }}
                  className="w-full flex items-center gap-3 px-6 py-3 hover:bg-surface-2 text-left duration-instant ease-default"
                >
                  <div className="w-10 h-10 bg-white p-1 overflow-hidden rounded-sm shrink-0">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-text-strong truncate">{p.name}</p>
                    <p className="text-caption text-text-muted">{p.brand}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.trim().length >= 2 && results.length === 0 && (
          <p className="text-body text-text-muted text-center py-12 px-6">
            {t("search.noResults", { query })}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
