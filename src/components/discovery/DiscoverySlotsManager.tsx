
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Product, DiscoverySetConfig } from "@/types/database";

interface DiscoverySlotsManagerProps {
  selectedConfig: DiscoverySetConfig;
  selectedProducts: Array<{ product: Product; slotIndex: number }>;
  onRemoveProduct: (slotIndex: number) => void;
}

export const DiscoverySlotsManager = ({ 
  selectedConfig, 
  selectedProducts, 
  onRemoveProduct 
}: DiscoverySlotsManagerProps) => {
  const generateSlots = () => {
    const slots: Array<{ slotIndex: number; volumeMl: number }> = [];
    
    // New schema: volume_ml is a single value, total_slots is the count
    for (let i = 0; i < selectedConfig.total_slots; i++) {
      slots.push({
        slotIndex: i,
        volumeMl: selectedConfig.volume_ml
      });
    }
    
    return slots;
  };

  const getProductInSlot = (slotIndex: number) => {
    return selectedProducts.find(p => p.slotIndex === slotIndex)?.product;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sloturile Tale ({selectedProducts.length}/{selectedConfig.total_slots})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generateSlots().map((slot) => {
            const productInSlot = getProductInSlot(slot.slotIndex);
            return (
              <div 
                key={slot.slotIndex}
                className="border-2 border-dashed border-border rounded-lg p-4 min-h-[120px] flex flex-col justify-center items-center"
              >
                <Badge variant="secondary" className="mb-2">
                  Slot {slot.slotIndex + 1} - {slot.volumeMl}ml
                </Badge>
                {productInSlot ? (
                  <div className="text-center">
                    <p className="font-medium text-sm">{productInSlot.brand}</p>
                    <p className="text-xs text-muted-foreground mb-2">{productInSlot.name}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveProduct(slot.slotIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Gol</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
