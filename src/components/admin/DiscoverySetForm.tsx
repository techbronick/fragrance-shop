import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Save, Loader2, Gift, Package, AlertCircle, Check, ChevronsUpDown } from 'lucide-react';
import { discoverySetUtils, skuUtils } from '@/utils/supabase-admin';
import { useToast } from '@/hooks/use-toast';
import { matchesSearch } from '@/utils/stringUtils';
import { cn } from '@/lib/utils';
import ImageUpload from '@/components/admin/ImageUpload';

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
  const [skuSearchQueries, setSkuSearchQueries] = useState<Record<number, string>>({});
  const [popoverOpen, setPopoverOpen] = useState<Record<number, boolean>>({});

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
        // Additional deduplication as safety measure (SKUs already deduplicated in getAllSKUs)
        const uniqueSKUs = Array.from(
          new Map(data.map((sku: any) => [sku.id, sku])).values()
        );
        setAllSKUs(uniqueSKUs);
      }
    };
    fetchAllSKUs();
  }, []);

  // Filter SKUs when volume changes (memoized for performance)
  useEffect(() => {
    const matching = allSKUs.filter(sku => sku.size_ml === formData.volume_ml);
    // Deduplicate by ID
    const uniqueMatching = Array.from(
      new Map(matching.map((sku: any) => [sku.id, sku])).values()
    );
    setAvailableSKUs(uniqueMatching);
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

  // Display-only formatter, used on initial load and for non-input price displays.
  const formatPrice = (priceInBani: number) => {
    if (!priceInBani) return '';
    return (priceInBani / 100).toFixed(2);
  };

  // Raw input string for the price field. Decoupled from formData.base_price (bani)
  // so typing "150" stays "150" instead of reformatting to "1.50" mid-keystroke.
  const [priceInput, setPriceInput] = useState<string>(() => formatPrice(formData.base_price));

  // Re-sync only when base_price was changed by something OTHER than our own typing
  // (Quick Template click, initial load, etc.). If the typed string already parses
  // to the same bani value, leave the typed text alone so "1" stays "1" instead of
  // becoming "1.00" mid-keystroke.
  useEffect(() => {
    const inputAsBani =
      priceInput.trim() === '' ? 0 : Math.round(parseFloat(priceInput) * 100);
    if (!isNaN(inputAsBani) && inputAsBani === formData.base_price) return;
    setPriceInput(formatPrice(formData.base_price));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.base_price]);

  const handlePriceChange = (raw: string) => {
    setPriceInput(raw);
    if (raw === '') {
      handleInputChange('base_price', 0);
      return;
    }
    const lei = parseFloat(raw);
    if (!isNaN(lei) && lei >= 0) {
      handleInputChange('base_price', Math.round(lei * 100));
    }
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
    // Search the FULL SKU list (not just `availableSKUs`, which is filtered by current
    // form volume). A saved slot can reference a SKU at a different size than the
    // form's current volume — we still need to render it correctly.
    return allSKUs.find(sku => sku.id === skuId) || availableSKUs.find(sku => sku.id === skuId);
  };

  const filledSlotsCount = selectedItems.filter(item => item.skuId).length;

  // Filter SKUs based on search for each slot (memoized for performance)
  const getFilteredSKUs = (slotIndex: number) => {
    const query = skuSearchQueries[slotIndex] || '';
    if (!query.trim()) {
      return availableSKUs;
    }
    
    const filtered = availableSKUs.filter(sku => {
      const productName = sku.products?.name || '';
      const productBrand = sku.products?.brand || '';
      const skuLabel = sku.label || '';
      return (
        matchesSearch(productName, query) ||
        matchesSearch(productBrand, query) ||
        matchesSearch(skuLabel, query)
      );
    });
    
    // Deduplicate by ID
    return Array.from(
      new Map(filtered.map((sku: any) => [sku.id, sku])).values()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Check if all slots are filled for non-customizable sets
    if (!formData.is_customizable) {
      const allSlotsFilled = selectedItems.every(item => item.skuId !== null);
      if (!allSlotsFilled) {
        toast({
          title: "Incomplete Configuration",
          description: `Please fill all ${formData.total_slots} slots before submitting.`,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      let configId = config?.id;
      let result;

      // Create or update the config
      if (configId) {
        result = await discoverySetUtils.updateConfig(configId, formData);
        if (result.error) {
          console.error('discovery set config update failed:', result.error);
          throw new Error(`${result.error.message}${result.error.details ? ` — ${result.error.details}` : ''}${result.error.hint ? ` (${result.error.hint})` : ''}`);
        }
        if (!result.data) {
          throw new Error('Update returned no row. RLS likely rejected the UPDATE. Verify is_admin() in SQL editor.');
        }
      } else {
        result = await discoverySetUtils.createConfig(formData);
        if (result.error) {
          console.error('discovery set config insert failed:', result.error);
          throw new Error(`${result.error.message}${result.error.details ? ` — ${result.error.details}` : ''}${result.error.hint ? ` (${result.error.hint})` : ''}`);
        }
        if (!result.data) {
          throw new Error('Insert returned no row. RLS likely rejected the INSERT.');
        }
        configId = result.data?.id;
      }

      // Save config items for predefined sets
      if (!formData.is_customizable && configId) {
        // Remove existing items first — surface any error so we don't leave the config half-deleted.
        const { data: existingItems, error: getErr } = await discoverySetUtils.getConfigItems(configId);
        if (getErr) throw new Error(`Failed to load existing items: ${getErr.message}`);
        if (existingItems) {
          for (const item of existingItems) {
            const { data: removedRows, error: removeErr } = await discoverySetUtils.removeConfigItem(item.id);
            if (removeErr) {
              console.error(`config item delete failed (slot ${item.slot_index + 1}):`, removeErr);
              throw new Error(`Failed to remove slot ${item.slot_index + 1}: ${removeErr.message}${removeErr.details ? ` — ${removeErr.details}` : ''}`);
            }
            if (!removedRows || removedRows.length === 0) {
              throw new Error(`Delete returned 0 rows for slot ${item.slot_index + 1}. RLS likely rejected the DELETE.`);
            }
          }
        }

        // Add new items — surface any error per slot.
        for (const item of selectedItems) {
          if (item.skuId) {
            const { data: addedRow, error: addErr } = await discoverySetUtils.addConfigItem({
              config_id: configId,
              sku_id: item.skuId,
              slot_index: item.slotIndex
            });
            if (addErr) {
              console.error(`config item insert failed (slot ${item.slotIndex + 1}):`, addErr);
              throw new Error(`Failed to add slot ${item.slotIndex + 1}: ${addErr.message}${addErr.details ? ` — ${addErr.details}` : ''}`);
            }
            if (!addedRow) {
              throw new Error(`Insert returned no row for slot ${item.slotIndex + 1}. RLS likely rejected the INSERT.`);
            }
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
          {/* Read-only Contents summary (visible whenever editing an existing set) */}
          {config?.id && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <Label className="text-base font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Conținut salvat
              </Label>
              {formData.is_customizable ? (
                <p className="text-sm text-muted-foreground">
                  Set personalizabil — clienții aleg conținutul ({formData.total_slots} sloturi × {formData.volume_ml}ml).
                </p>
              ) : selectedItems.filter(i => i.skuId).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Niciun produs salvat încă. Selectează produsele mai jos pentru fiecare slot.
                </p>
              ) : (
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  {selectedItems
                    .filter(i => i.skuId)
                    .map(i => {
                      const s = getSkuDetails(i.skuId);
                      const sizeMl = s?.size_ml ? `${s.size_ml}ml` : '';
                      return (
                        <li key={i.slotIndex}>
                          {s?.products?.brand ? `${s.products.brand} — ${s.products.name}` : 'Produs necunoscut'}
                          {sizeMl ? ` · ${sizeMl}` : ''}
                        </li>
                      );
                    })}
                </ol>
              )}
            </div>
          )}

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
                value={priceInput}
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
            <ImageUpload
              value={formData.image_url}
              onChange={(url) => handleInputChange('image_url', url)}
              bucket="discovery-sets-images"
              label="Discovery Set Image"
              fileName={formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : undefined}
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
                value={formData.total_slots || ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') return handleInputChange('total_slots', 0);
                  const n = parseInt(raw);
                  if (!isNaN(n)) handleInputChange('total_slots', n);
                }}
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
                value={formData.volume_ml || ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') return handleInputChange('volume_ml', 0);
                  const n = parseInt(raw);
                  if (!isNaN(n)) handleInputChange('volume_ml', n);
                }}
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
                        
                        <Popover 
                          open={popoverOpen[item.slotIndex] || false}
                          onOpenChange={(open) => setPopoverOpen(prev => ({ ...prev, [item.slotIndex]: open }))}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={popoverOpen[item.slotIndex]}
                              className="flex-1 justify-between"
                            >
                              {selectedSku
                                ? `${selectedSku.products?.brand} - ${selectedSku.products?.name}`
                                : "Selectează un parfum..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command filter={(value, search) => {
                              // Disable built-in filtering, we handle it manually
                              return 1;
                            }}>
                              <CommandInput 
                                placeholder="Caută parfum..." 
                                value={skuSearchQueries[item.slotIndex] || ''}
                                onValueChange={(value) => setSkuSearchQueries(prev => ({ ...prev, [item.slotIndex]: value }))}
                              />
                              <CommandList>
                                <CommandEmpty>Nu s-au găsit parfumuri.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="__none__"
                                    onSelect={() => {
                                      handleSlotSelect(item.slotIndex, "__none__");
                                      setPopoverOpen(prev => ({ ...prev, [item.slotIndex]: false }));
                                      setSkuSearchQueries(prev => ({ ...prev, [item.slotIndex]: '' }));
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        !item.skuId ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="text-muted-foreground">-- Slot gol --</span>
                                  </CommandItem>
                                  {getFilteredSKUs(item.slotIndex).map((sku, skuIndex) => {
                                    // Create searchable value for Command component filtering
                                    const searchableValue = `${sku.products?.brand || ''} ${sku.products?.name || ''} ${sku.label || ''} ${sku.size_ml}ml`.trim();
                                    return (
                                      <CommandItem
                                        key={`${sku.id}-${item.slotIndex}-${skuIndex}`}
                                        value={searchableValue}
                                        onSelect={() => {
                                          handleSlotSelect(item.slotIndex, sku.id);
                                          setPopoverOpen(prev => ({ ...prev, [item.slotIndex]: false }));
                                          setSkuSearchQueries(prev => ({ ...prev, [item.slotIndex]: '' }));
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            item.skuId === sku.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{sku.products?.brand}</span>
                                          <span className="text-muted-foreground">-</span>
                                          <span>{sku.products?.name}</span>
                                          <Badge variant="outline" className="ml-2 text-xs">
                                            {sku.size_ml}ml
                                          </Badge>
                                        </div>
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

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
            <Button 
              type="submit" 
              disabled={loading || (!formData.is_customizable && filledSlotsCount < formData.total_slots)}
            >
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
