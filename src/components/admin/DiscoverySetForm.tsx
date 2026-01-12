import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2, Gift, Package, AlertCircle, Check } from 'lucide-react';
import { discoverySetUtils, skuUtils } from '@/utils/supabase-admin';
import { useToast } from '@/hooks/use-toast';

interface DiscoverySetFormProps {
  config?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface SlotSelection {
  slotIndex: number;
  skuId: string | null;
}

const DiscoverySetForm: React.FC<DiscoverySetFormProps> = ({ config, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [formData, setFormData] = useState({
    name: config?.name || '',
    description: config?.description || '',
    base_price: config?.base_price || 25000,
    image_url: config?.image_url || '',
    is_active: config?.is_active ?? true,
    is_customizable: config?.is_customizable ?? true,
    total_slots: config?.total_slots || 3,
    volume_ml: config?.volume_ml || 2
  });

  // State for slot selections (predefined sets)
  const [selectedItems, setSelectedItems] = useState<SlotSelection[]>([]);
  const [availableSKUs, setAvailableSKUs] = useState<any[]>([]);
  const [allSKUs, setAllSKUs] = useState<any[]>([]);

  const predefinedConfigs = [
    { name: "Trixter", description: "3 mostre de 2ml", total_slots: 3, volume_ml: 2, base_price: 18000, is_customizable: true },
    { name: "Premium", description: "3 mostre de 5ml", total_slots: 3, volume_ml: 5, base_price: 37500, is_customizable: true },
    { name: "Intensiv", description: "3 mostre de 10ml", total_slots: 3, volume_ml: 10, base_price: 75000, is_customizable: true },
    { name: "Explorer", description: "5 mostre de 2ml", total_slots: 5, volume_ml: 2, base_price: 28000, is_customizable: true },
    { name: "Predefined Set", description: "Set cu parfumuri fixe", total_slots: 5, volume_ml: 2, base_price: 30000, is_customizable: false },
  ];

  // Fetch all SKUs on mount
  useEffect(() => {
    const fetchAllSKUs = async () => {
      const { data, error } = await skuUtils.getAllSKUs();
      if (!error && data) {
        setAllSKUs(data);
      }
    };
    fetchAllSKUs();
  }, []);

  // Filter SKUs when volume changes
  useEffect(() => {
    const matching = allSKUs.filter(sku => sku.size_ml === formData.volume_ml);
    setAvailableSKUs(matching);
  }, [allSKUs, formData.volume_ml]);

  // Initialize slots when total_slots changes or when not customizable
  useEffect(() => {
    if (!formData.is_customizable) {
      setSelectedItems(prev => {
        const newItems: SlotSelection[] = [];
        for (let i = 0; i < formData.total_slots; i++) {
          // Keep existing selection if available
          const existing = prev.find(item => item.slotIndex === i);
          newItems.push({
            slotIndex: i,
            skuId: existing?.skuId || null
          });
        }
        return newItems;
      });
    }
  }, [formData.total_slots, formData.is_customizable]);

  // Load existing items when editing a predefined set
  useEffect(() => {
    const loadExistingItems = async () => {
      if (config?.id && !config.is_customizable) {
        setLoadingItems(true);
        try {
          const { data, error } = await discoverySetUtils.getConfigItems(config.id);
          if (!error && data) {
            const items: SlotSelection[] = [];
            for (let i = 0; i < formData.total_slots; i++) {
              const existing = data.find((item: any) => item.slot_index === i);
              items.push({
                slotIndex: i,
                skuId: existing?.sku_id || null
              });
            }
            setSelectedItems(items);
          }
        } catch (error) {
          console.error('Error loading config items:', error);
        } finally {
          setLoadingItems(false);
        }
      }
    };
    loadExistingItems();
  }, [config?.id, config?.is_customizable, formData.total_slots]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPrice = (priceInBani: number) => (priceInBani / 100).toFixed(2);

  const handlePriceChange = (priceInLei: string) => {
    const priceInBani = Math.round(parseFloat(priceInLei || '0') * 100);
    handleInputChange('base_price', priceInBani);
  };

  const applyPredefinedConfig = (predefined: typeof predefinedConfigs[0]) => {
    setFormData(prev => ({
      ...prev,
      name: predefined.name,
      description: predefined.description,
      total_slots: predefined.total_slots,
      volume_ml: predefined.volume_ml,
      base_price: predefined.base_price,
      is_customizable: predefined.is_customizable
    }));
    // Clear slot selections when applying a template
    setSelectedItems([]);
  };

  const handleSlotSelect = (slotIndex: number, skuId: string) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.slotIndex === slotIndex 
          ? { ...item, skuId: skuId === "__none__" ? null : skuId }
          : item
      )
    );
  };

  const getSkuDetails = (skuId: string | null) => {
    if (!skuId) return null;
    return availableSKUs.find(sku => sku.id === skuId);
  };

  const filledSlotsCount = selectedItems.filter(item => item.skuId).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let configId = config?.id;
      let result;

      // Create or update the config
      if (configId) {
        result = await discoverySetUtils.updateConfig(configId, formData);
      } else {
        result = await discoverySetUtils.createConfig(formData);
        configId = result.data?.id;
      }

      if (result.error) throw new Error(result.error.message);

      // Save config items for predefined sets
      if (!formData.is_customizable && configId) {
        // Remove existing items first
        const { data: existingItems } = await discoverySetUtils.getConfigItems(configId);
        if (existingItems) {
          for (const item of existingItems) {
            await discoverySetUtils.removeConfigItem(item.id);
          }
        }

        // Add new items
        for (const item of selectedItems) {
          if (item.skuId) {
            await discoverySetUtils.addConfigItem({
              config_id: configId,
              sku_id: item.skuId,
              slot_index: item.slotIndex
            });
          }
        }
      }

      toast({
        title: config?.id ? "Config Updated" : "Config Created",
        description: `${formData.name} has been ${config?.id ? 'updated' : 'created'} successfully.`,
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          {config?.id ? 'Edit Discovery Set Config' : 'Add New Discovery Set Config'}
        </CardTitle>
        <CardDescription>
          {config?.id ? 'Update discovery set configuration' : 'Create a new discovery set template'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Templates */}
          {!config?.id && (
            <div className="space-y-3">
              <Label>Quick Templates</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {predefinedConfigs.map((predefined, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => applyPredefinedConfig(predefined)}
                  >
                    <div>
                      <div className="font-medium text-sm">{predefined.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {predefined.total_slots}×{predefined.volume_ml}ml • {formatPrice(predefined.base_price)} Lei
                        {!predefined.is_customizable && (
                          <span className="ml-1 text-amber-600">• Predefinit</span>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Discovery Set Classic"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="base_price">Base Price (Lei) *</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                min="0"
                value={formatPrice(formData.base_price)}
                onChange={(e) => handlePriceChange(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              type="url"
            />
          </div>

          {/* Slot Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_slots">Total Slots *</Label>
              <Input
                id="total_slots"
                type="number"
                min="1"
                max="20"
                value={formData.total_slots}
                onChange={(e) => handleInputChange('total_slots', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume_ml">Volume per Sample (ml) *</Label>
              <Input
                id="volume_ml"
                type="number"
                min="1"
                max="100"
                value={formData.volume_ml}
                onChange={(e) => handleInputChange('volume_ml', parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm space-y-1">
              <div><strong>Configuration:</strong> {formData.total_slots}×{formData.volume_ml}ml</div>
              <div><strong>Total Volume:</strong> {formData.total_slots * formData.volume_ml}ml</div>
              <div><strong>Price per Slot:</strong> {(formData.base_price / 100 / formData.total_slots).toFixed(2)} Lei</div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_customizable"
                checked={formData.is_customizable}
                onCheckedChange={(checked) => handleInputChange('is_customizable', checked)}
              />
              <Label htmlFor="is_customizable">Customizable</Label>
              <span className="text-sm text-muted-foreground">
                {formData.is_customizable ? 'Users choose their own fragrances' : 'Predefined fragrances (select below)'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
              <span className="text-sm text-muted-foreground">
                {formData.is_active ? 'Visible to customers' : 'Hidden'}
              </span>
            </div>
          </div>

          {/* Slot Selection UI - Only shown when NOT customizable */}
          {!formData.is_customizable && (
            <div className="space-y-4 border rounded-lg p-4 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Selectează produsele pentru fiecare slot
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Alege parfumuri cu mostre de {formData.volume_ml}ml pentru acest set predefinit.
                  </p>
                </div>
                <Badge variant={filledSlotsCount === formData.total_slots ? "default" : "secondary"}>
                  {filledSlotsCount}/{formData.total_slots} slots
                </Badge>
              </div>

              {loadingItems ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Se încarcă produsele...</span>
                </div>
              ) : (
                <div className="grid gap-3">
                  {selectedItems.map((item) => {
                    const selectedSku = getSkuDetails(item.skuId);
                    return (
                      <div 
                        key={item.slotIndex} 
                        className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                      >
                        <Badge 
                          variant={item.skuId ? "default" : "outline"} 
                          className="shrink-0 w-16 justify-center"
                        >
                          {item.skuId ? <Check className="h-3 w-3 mr-1" /> : null}
                          Slot {item.slotIndex + 1}
                        </Badge>
                        
                        <Select
                          value={item.skuId || "__none__"}
                          onValueChange={(value) => handleSlotSelect(item.slotIndex, value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selectează un parfum...">
                              {selectedSku ? (
                                <span>
                                  {selectedSku.products?.brand} - {selectedSku.products?.name}
                                </span>
                              ) : (
                                "Selectează un parfum..."
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">
                              <span className="text-muted-foreground">-- Slot gol --</span>
                            </SelectItem>
                            {availableSKUs.map(sku => (
                              <SelectItem key={sku.id} value={sku.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{sku.products?.brand}</span>
                                  <span className="text-muted-foreground">-</span>
                                  <span>{sku.products?.name}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {sku.size_ml}ml
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedSku && (
                          <Badge variant="secondary" className="shrink-0">
                            {formatPrice(selectedSku.price)} Lei
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {availableSKUs.length === 0 && !loadingItems && (
                <div className="flex items-center gap-2 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-800 dark:text-amber-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="text-sm">
                    Nu există SKU-uri de {formData.volume_ml}ml. Creează mai întâi mostre de această dimensiune în tab-ul Samples.
                  </p>
                </div>
              )}

              {filledSlotsCount > 0 && filledSlotsCount < formData.total_slots && (
                <p className="text-sm text-muted-foreground">
                  💡 Poți lăsa sloturi goale, dar setul va fi incomplet pentru clienți.
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {config?.id ? 'Update Config' : 'Create Config'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DiscoverySetForm;
