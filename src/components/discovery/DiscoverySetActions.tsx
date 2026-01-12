import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/formatPrice";
import { Check } from "lucide-react";

interface DiscoverySetActionsProps {
  totalPrice: number;
  selectedCount: number;
  totalSlots: number;
  isSetComplete: boolean;
  isAnimating?: boolean;
  onAddToCart: () => void;
}

export const DiscoverySetActions = ({ 
  totalPrice, 
  selectedCount, 
  totalSlots, 
  isSetComplete, 
  isAnimating = false,
  onAddToCart 
}: DiscoverySetActionsProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">
              Total: {formatPrice(totalPrice)}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedCount}/{totalSlots} parfumuri selectate
            </p>
          </div>
          <Button 
            onClick={onAddToCart} 
            disabled={!isSetComplete || isAnimating}
            className={`${isAnimating ? "bg-green-500 text-white animate-pulse" : ""}`}
          >
            {isAnimating ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Adăugat în coș!
              </>
            ) : (
              "Adaugă în Coș"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
