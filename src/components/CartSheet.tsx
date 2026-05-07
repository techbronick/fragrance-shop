import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, CartItem } from "@/hooks/useCart";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { ShippingEstimateForCart } from "@/components/ShippingEstimateForCart";
import { Minus, Plus, X } from "lucide-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  children: ReactNode;
};

export function CartSheet({ children }: Props) {
  const { t } = useTranslation("common");
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const href = useLocalizedHref();

  const subtotalLei = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const goCheckout = () => navigate(href("/checkout"));

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] flex flex-col p-0 bg-surface"
      >
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="text-h2 font-medium text-text-strong">
            {t("cart.title")}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-body text-text-muted text-center py-12">
              {t("cart.empty")}
            </p>
          ) : (
            items.map((item) => (
              <CartLine
                key={item.id + (item.skuId ?? '')}
                item={item}
                onQty={updateQuantity}
                onRemove={removeItem}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-4 space-y-3">
            <div className="flex justify-between text-body">
              <span className="text-text-muted">{t("cart.subtotal")}</span>
              <span className="text-text-strong">{subtotalLei.toFixed(2)} Lei</span>
            </div>
            <ShippingEstimateForCart />
            <SheetClose asChild>
              <Button variant="primary" size="lg" className="w-full" onClick={goCheckout}>
                {t("cart.checkout")}
              </Button>
            </SheetClose>
            <Button variant="ghost" size="sm" className="w-full" onClick={clearCart}>
              {t("cart.clear")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartLine({
  item,
  onQty,
  onRemove,
}: {
  item: CartItem;
  onQty: (id: string, skuId: string | undefined, qty: number) => void;
  onRemove: (id: string, skuId?: string) => void;
}) {
  const { t } = useTranslation("common");
  const dec = () => onQty(item.id, item.skuId, Math.max(1, item.quantity - 1));
  const inc = () => onQty(item.id, item.skuId, item.quantity + 1);

  return (
    <div className="flex gap-4">
      {item.image && (
        <div className="w-16 h-16 bg-white p-2 overflow-hidden rounded-sm shrink-0">
          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-body text-text-strong truncate">{item.name}</p>
        {item.brand && <p className="text-caption text-text-muted">{item.brand}</p>}
        {item.sizeLabel && <p className="text-caption text-text-muted">{item.sizeLabel}</p>}
        <div className="flex items-center gap-3 mt-2">
          <Button variant="ghost" size="icon" onClick={dec} aria-label={t("cart.decreaseQty")}>
            <Minus />
          </Button>
          <span className="text-body min-w-[20px] text-center">{item.quantity}</span>
          <Button variant="ghost" size="icon" onClick={inc} aria-label={t("cart.increaseQty")}>
            <Plus />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.id, item.skuId)}
          aria-label={t("cart.remove")}
        >
          <X />
        </Button>
        <p className="text-body text-text-strong">
          {(item.price * item.quantity).toFixed(2)} Lei
        </p>
      </div>
    </div>
  );
}
