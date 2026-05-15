import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Save, Loader2, Package, Wine, TestTube, DollarSign, Trash2, Edit } from 'lucide-react';
import { productUtils, skuUtils } from '@/utils/supabase-admin';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from "@/components/ui/checkbox";
import { Product } from "@/types/database";
import ImageUpload from '@/components/admin/ImageUpload';
import SKUForm from '@/components/admin/SKUForm';

interface SKUFormData {
  id?: string; // present when this SKU already exists in the DB
  size_ml: number;
  price: number; // in bani
  stock: number;
  label: string;
}

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
    notes_top: product?.notes_top || [],
    notes_mid: product?.notes_mid || [],
    notes_base: product?.notes_base || [],
    concentration: product?.concentration || 'EDP',
    family: product?.family || '',
    gender_neutral: product?.gender_neutral || false,
    launch_year: product?.launch_year || new Date().getFullYear(),
    rating: product?.rating || 0,
    review_count: product?.review_count || 0,
    stock_volume: product?.stock_volume || 0
  });

  const [newNote, setNewNote] = useState({ top: '', mid: '', base: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // SKU management state
  const [skus, setSkus] = useState<SKUFormData[]>([]);
  const [skusLoading, setSkusLoading] = useState(false);
  const [showSKUForm, setShowSKUForm] = useState(false);
  // null = adding new; otherwise index of the existing SKU being edited.
  const [editingSKUIndex, setEditingSKUIndex] = useState<number | null>(null);

  // Load existing SKUs when editing an existing product. Re-runnable so that
  // direct-to-DB SKU edits (Add/Edit/Delete) can refresh the list.
  const loadSKUs = React.useCallback(async () => {
    if (!product?.id) return;
    setSkusLoading(true);
    try {
      const { data, error } = await skuUtils.getSKUsByProductIds([product.id]);
      if (error) {
        console.error('Failed to load SKUs for product edit:', error);
        return;
      }
      const loaded: SKUFormData[] = (data ?? [])
        .map((s: any) => ({
          id: s.id,
          size_ml: s.size_ml,
          price: s.price,
          stock: s.stock,
          label: s.label,
        }))
        .sort((a, b) => a.size_ml - b.size_ml);
      setSkus(loaded);
    } finally {
      setSkusLoading(false);
    }
  }, [product?.id]);

  useEffect(() => {
    loadSKUs();
  }, [loadSKUs]);

  const [currentSKU, setCurrentSKU] = useState<SKUFormData>({
    size_ml: 50,
    price: 10000, // 100 Lei in bani
    stock: 0,
    label: ''
  });

  const concentrations = [
    'Parfum',
    'Eau de Parfum',
    'Eau de Toilette',
    'Eau de Cologne',
    'Eau Fraiche'
  ];

  const families = [
    'Oriental',
    'Woody',
    'Fresh',
    'Floral',
    'Aromatic',
    'Citrus',
    'Gourmand',
    'Aquatic',
    'Green',
    'Fruity'
  ];

  const predefinedSizes = [
    { ml: 1, label: 'Sample 1ml', type: 'sample' },
    { ml: 2, label: 'Sample 2ml', type: 'sample' },
    { ml: 5, label: 'Sample 5ml', type: 'sample' },
    { ml: 10, label: 'Travel 10ml', type: 'bottle' },
    { ml: 30, label: 'Small 30ml', type: 'bottle' },
    { ml: 50, label: 'Standard 50ml', type: 'bottle' },
    { ml: 75, label: 'Large 75ml', type: 'bottle' },
    { ml: 100, label: 'Full Size 100ml', type: 'bottle' },
    { ml: 125, label: 'XL 125ml', type: 'bottle' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addNote = (type: 'top' | 'mid' | 'base') => {
    const note = newNote[type].trim();
    if (note) {
      setFormData(prev => ({
        ...prev,
        [`notes_${type}`]: [...prev[`notes_${type}`], note]
      }));
      setNewNote(prev => ({ ...prev, [type]: '' }));
    }
  };

  const removeNote = (type: 'top' | 'mid' | 'base', index: number) => {
    setFormData(prev => ({
      ...prev,
      [`notes_${type}`]: prev[`notes_${type}`].filter((_, i) => i !== index)
    }));
  };

  const handleNotesChange = (field: "notes_top" | "notes_mid" | "notes_base", value: string) => {
    const notes = value.split(",").map(note => note.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: notes }));
  };

  // SKU Management Functions
  const handleSKUInputChange = (field: keyof SKUFormData, value: any) => {
    setCurrentSKU(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate label when size changes
      if (field === 'size_ml' && !updated.label) {
        const predefined = predefinedSizes.find(s => s.ml === value);
        updated.label = predefined ? predefined.label : `${value}ml`;
      }
      
      return updated;
    });
  };

  const handlePriceChange = (priceInLei: string) => {
    const priceInBani = Math.round(parseFloat(priceInLei || '0') * 100);
    handleSKUInputChange('price', priceInBani);
  };

  const resetSKUForm = () => {
    setCurrentSKU({
      size_ml: 50,
      price: 10000,
      stock: 0,
      label: ''
    });
    setEditingSKUIndex(null);
    setShowSKUForm(false);
  };

  const addSKU = () => {
    if (!currentSKU.size_ml || !currentSKU.label) {
      toast({
        title: "Validation Error",
        description: "Please provide size and label for the SKU",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate sizes: but allow the SKU being edited to keep its current size.
    const isDuplicate = skus.some(
      (sku, i) => sku.size_ml === currentSKU.size_ml && i !== editingSKUIndex,
    );
    if (isDuplicate) {
      toast({
        title: "Duplicate Size",
        description: `A SKU with ${currentSKU.size_ml}ml already exists`,
        variant: "destructive",
      });
      return;
    }

    if (editingSKUIndex !== null) {
      // Update the SKU at that index, preserving its `id` (if it has one) so
      // the save flow knows it's an existing row to UPDATE rather than INSERT.
      setSkus(prev =>
        prev.map((sku, i) =>
          i === editingSKUIndex ? { ...sku, ...currentSKU } : sku,
        ),
      );
      toast({
        title: "SKU Updated",
        description: `${currentSKU.label} has been updated.`,
      });
    } else {
      setSkus(prev => [...prev, { ...currentSKU }]);
      toast({
        title: "SKU Added",
        description: `${currentSKU.label} has been added to the list`,
      });
    }

    resetSKUForm();
  };

  const editSKU = (index: number) => {
    const sku = skus[index];
    if (!sku) return;
    setCurrentSKU({
      size_ml: sku.size_ml,
      price: sku.price,
      stock: sku.stock,
      label: sku.label,
    });
    setEditingSKUIndex(index);
    setShowSKUForm(true);
  };

  const removeSKU = async (index: number) => {
    const target = skus[index];
    if (!target) return;
    if (editingSKUIndex === index) resetSKUForm();

    // Editing existing product → delete from DB and refresh.
    if (product?.id && target.id) {
      const { error } = await skuUtils.deleteSKU(target.id);
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete SKU",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "SKU Deleted", description: `${target.label} has been removed.` });
      await loadSKUs();
      return;
    }

    // New product (staged) → drop from local state.
    setSkus(prev => prev.filter((_, i) => i !== index));
  };

  const formatPrice = (priceInBani: number) => {
    return (priceInBani / 100).toFixed(2);
  };

  const isBottle = (sizeMl: number) => sizeMl >= 10;
  const isSample = (sizeMl: number) => sizeMl < 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let productResult;
      if (product?.id) {
        // Update existing product
        productResult = await productUtils.updateProduct(product.id, formData);
        if (productResult.error) {
          console.error('product update failed:', productResult.error);
          throw new Error(`${productResult.error.message}${productResult.error.details ? `: ${productResult.error.details}` : ''}${productResult.error.hint ? ` (${productResult.error.hint})` : ''}`);
        }
        if (!productResult.data) {
          throw new Error('Update returned no row. RLS likely rejected the UPDATE. Verify is_admin() in SQL editor.');
        }
      } else {
        // Create new product
        productResult = await productUtils.createProduct(formData);
        if (productResult.error) {
          console.error('product insert failed:', productResult.error);
          throw new Error(`${productResult.error.message}${productResult.error.details ? `: ${productResult.error.details}` : ''}${productResult.error.hint ? ` (${productResult.error.hint})` : ''}`);
        }
        if (!productResult.data) {
          throw new Error('Insert returned no row. RLS likely rejected the INSERT.');
        }
      }

      const productId = product?.id || productResult.data?.id;

      // Persist SKUs: existing ones (with id) → UPDATE, new ones → INSERT.
      if (productId && skus.length > 0) {
        const skuResults = await Promise.all(
          skus.map(sku => {
            if (sku.id) {
              const { id, ...updates } = sku;
              return skuUtils.updateSKU(id, updates);
            }
            return skuUtils.createSKU({ ...sku, product_id: productId });
          })
        );
        const failedSKUs = skuResults.filter(r => r.error || !r.data);

        if (failedSKUs.length > 0) {
          console.error('Some SKUs failed to save:', failedSKUs);
          toast({
            title: product?.id ? "Product Updated" : "Product Created",
            description: `Product saved, but ${failedSKUs.length} SKU(s) failed to save.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: product?.id ? "Product Updated" : "Product Created",
            description: `${formData.name} and ${skus.length} SKU(s) have been ${product?.id ? 'updated' : 'created'} successfully.`,
          });
        }
      } else {
        toast({
          title: product?.id ? "Product Updated" : "Product Created",
          description: `${formData.name} has been ${product?.id ? 'updated' : 'created'} successfully.`,
        });
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>{product?.id ? 'Edit Product' : 'Add New Product'}</CardTitle>
        <CardDescription>
          {product?.id ? 'Update product information' : 'Create a new luxury perfume product with SKUs'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Santal 33"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="e.g., Le Labo"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed product description..."
              rows={4}
              required
            />
          </div>

          {/* Stock Volume */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="stock_volume">Stock Volume (ml)</Label>
              <Input
                id="stock_volume"
                type="number"
                min="0"
                value={formData.stock_volume}
                onChange={(e) => handleInputChange('stock_volume', parseInt(e.target.value) || 0)}
                placeholder="Total available volume in ml"
              />
              <p className="text-xs text-muted-foreground">
                Total available perfume volume in milliliters
              </p>
            </div>

            {/* Bottle Division Display */}
            {formData.stock_volume > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Wine className="h-4 w-4" />
                  Stock Volume Division ({formData.stock_volume} ml total)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[2, 3, 5, 10, 50, 100].map((bottleSize) => {
                    const count = Math.floor(formData.stock_volume / bottleSize);
                    const remainder = formData.stock_volume % bottleSize;
                    return (
                      <div
                        key={bottleSize}
                        className="text-center p-3 bg-background rounded-lg border"
                      >
                        <div className="flex justify-center mb-1">
                          {bottleSize >= 10 ? (
                            <Wine className="h-5 w-5 text-blue-600" />
                          ) : (
                            <TestTube className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                        <div className="text-lg font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground">{bottleSize} ml bottles</div>
                        {remainder > 0 && (
                          <div className="text-xs text-orange-500 mt-1">+{remainder} ml left</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <ImageUpload
              value={formData.image_url}
              onChange={(url) => handleInputChange('image_url', url)}
              bucket="product-images"
              label="Product Image"
              fileName={formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') : undefined}
            />
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="concentration">Concentration</Label>
              <Select
                value={formData.concentration}
                onValueChange={(value) => handleInputChange('concentration', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {concentrations.map(conc => (
                    <SelectItem key={conc} value={conc}>{conc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="family">Fragrance Family</Label>
              <Select
                value={formData.family}
                onValueChange={(value) => handleInputChange('family', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {families.map(family => (
                    <SelectItem key={family} value={family}>{family}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="launch_year">Launch Year</Label>
              <Input
                id="launch_year"
                type="number"
                value={formData.launch_year}
                onChange={(e) => handleInputChange('launch_year', parseInt(e.target.value))}
                min="1900"
                max={new Date().getFullYear() + 5}
              />
            </div>
          </div>

          {/* Gender Neutral Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gender_neutral"
              checked={formData.gender_neutral}
              onCheckedChange={(checked) => handleInputChange('gender_neutral', checked)}
            />
            <Label htmlFor="gender_neutral">Gender Neutral</Label>
          </div>

          {/* Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review_count">Review Count</Label>
              <Input
                id="review_count"
                type="number"
                min="0"
                value={formData.review_count}
                onChange={(e) => handleInputChange('review_count', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Fragrance Notes */}
          {['top', 'mid', 'base'].map((noteType) => (
            <div key={noteType} className="space-y-2">
              <Label className="text-sm font-medium capitalize">
                {noteType === 'mid' ? 'Heart' : noteType} Notes
              </Label>
              <div className="flex gap-2">
                <Input
                  value={newNote[noteType as keyof typeof newNote]}
                  onChange={(e) => setNewNote(prev => ({ ...prev, [noteType]: e.target.value }))}
                  placeholder={`Add ${noteType} note...`}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNote(noteType as any))}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addNote(noteType as any)}
                  disabled={!newNote[noteType as keyof typeof newNote].trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(formData[`notes_${noteType}` as keyof typeof formData]) &&
                  (formData[`notes_${noteType}` as keyof typeof formData] as string[]).map((note: string, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {note}
                      <Button
                        type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeNote(noteType as any, index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}

          <Separator />

          {/* SKU Management Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product SKUs
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add size variants, pricing, and stock levels for this product
                </p>
              </div>
              {!showSKUForm && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSKUForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add SKU
                </Button>
              )}
            </div>

            {/* SKU Form: reuses the standalone SKUForm component.
                Editing existing product → direct DB save (independent of parent product save).
                Creating new product → stage into local state, batch-save with the product. */}
            {showSKUForm && (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6">
                  <SKUForm
                    key={editingSKUIndex ?? 'new'}
                    sku={editingSKUIndex !== null ? skus[editingSKUIndex] : undefined}
                    productId={product?.id}
                    hideProductPicker
                    onCancel={resetSKUForm}
                    onSuccess={async () => {
                      // Direct-to-DB path (existing product): refresh and close.
                      await loadSKUs();
                      resetSKUForm();
                    }}
                    onSubmitDraft={
                      product?.id
                        ? undefined
                        : (draft) => {
                            // Stage path (new product, no id yet).
                            const isDuplicate = skus.some(
                              (s, i) => s.size_ml === draft.size_ml && i !== editingSKUIndex,
                            );
                            if (isDuplicate) {
                              toast({
                                title: "Duplicate Size",
                                description: `A SKU with ${draft.size_ml}ml already exists`,
                                variant: "destructive",
                              });
                              return;
                            }
                            if (editingSKUIndex !== null) {
                              setSkus(prev =>
                                prev.map((s, i) => (i === editingSKUIndex ? { ...s, ...draft } : s)),
                              );
                              toast({ title: "SKU Updated", description: `${draft.label} has been updated.` });
                            } else {
                              setSkus(prev => [...prev, draft]);
                              toast({ title: "SKU Added", description: `${draft.label} has been added.` });
                            }
                            resetSKUForm();
                          }
                    }
                  />
                </CardContent>
              </Card>
            )}

            {/* SKU List */}
            {skus.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Added SKUs ({skus.length})
                  </Label>
                  <Badge variant="secondary">
                    {skus.filter(s => isBottle(s.size_ml)).length} bottles, {skus.filter(s => isSample(s.size_ml)).length} samples
                  </Badge>
                </div>
                <div className="space-y-2">
                  {skus.map((sku, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg border"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {isBottle(sku.size_ml) ? (
                          <Wine className="h-5 w-5 text-blue-600" />
                        ) : (
                          <TestTube className="h-5 w-5 text-amber-600" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sku.label}</span>
                            <Badge variant="outline">{sku.size_ml}ml</Badge>
                            {isBottle(sku.size_ml) ? (
                              <Badge variant="secondary">Bottle</Badge>
                            ) : (
                              <Badge variant="secondary">Sample</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatPrice(sku.price)} Lei
                            </span>
                            <span>Stock: {sku.stock}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => editSKU(index)}
                          aria-label="Edit SKU"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSKU(index)}
                          className="text-destructive hover:text-destructive"
                          aria-label="Delete SKU"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skus.length === 0 && !showSKUForm && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  No SKUs added yet. Add your first SKU to get started.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSKUForm(true)}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Add First SKU
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {product?.id ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm; 