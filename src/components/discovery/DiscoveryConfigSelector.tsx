
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscoverySetConfig } from "@/types/database";
import { formatPrice } from "@/utils/formatPrice";

interface DiscoveryConfigSelectorProps {
  selectedConfig: DiscoverySetConfig;
  onConfigChange: () => void;
}

export const DiscoveryConfigSelector = ({ selectedConfig, onConfigChange }: DiscoveryConfigSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurația Selectată: {selectedConfig.name}</CardTitle>
      </CardHeader>
      <CardContent>
  <div className="flex flex-wrap gap-2 mb-4">
    <Badge variant="outline">
      {selectedConfig.total_slots}×{selectedConfig.volume_ml}ml
    </Badge>
  </div>
  <div className="flex items-center gap-4">
    <span className="font-semibold">Preț bază: {formatPrice(selectedConfig.base_price)}</span>
    <Button variant="outline" onClick={onConfigChange}>
      Schimbă Configurația
    </Button>
  </div>
</CardContent>
    </Card>
  );
};
