import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, DollarSign, Package2 } from 'lucide-react';
import { skuUtils, productUtils } from '@/utils/supabase-admin';
import { useToast } from '@/hooks/use-toast';

interface SKUFormProps {
  sku?: any;
  productId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SKUForm: React.FC<SKUFormProps> = ({ sku, productId, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: sku?.product_id || productId || '',
    size_ml: sku?.size_ml || 50,
    price: sku?.price || 10000, // in bani (100 Lei)
    stock: sku?.stock || 0,
    label: sku?.label || ''
  });

  const predefinedSizes = [
    { ml: 1, label: 'Sample 1ml' },
    { ml: 2, label: 'Sample 2ml' },
    { ml: 5, label: 'Sample 5ml' },
    { ml: 10, label: 'Travel 10ml' },
    { ml: 30, label: 'Small 30ml' },
    { ml: 50, label: 'Standard 50ml' },
    { ml: 75, label: 'Large 75ml' },
    { ml: 100, label: 'Full Size 100ml' },
    { ml: 125, label: 'XL 125ml' }
  ];

  useEffect(() => {
    loadProducts();
    if (formData.size_ml && !formData.label) {
      generateLabel();
    }
  }, [formData.size_ml, formData.product_id]);

  const loadProducts = async () => {
    try {
      const { data, error } = await productUtils.getAllProducts();
      if (!error && data) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const generateLabel = () => {
    const predefined = predefinedSizes.find(size => size.ml === formData.size_ml);
    if (predefined) {
      setFormData(prev => ({ ...prev, label: predefined.label }));
    } else {
      setFormData(prev => ({ ...prev, label: `${formData.size_ml}ml` }));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPrice = (priceInBani: number) => {
    return (priceInBani / 100).toFixed(2);
  };

  const handlePriceChange = (priceInLei: string) => {
    const priceInBani = Math.round(parseFloat(priceInLei || '0') * 100);
    handleInputChange('price', priceInBani);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (sku?.id) {
        // Update existing SKU
        result = await skuUtils.updateSKU(sku.id, formData);
      } else {
        // Create new SKU
        result = await skuUtils.createSKU(formData);
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: sku?.id ? "SKU Updated" : "SKU Created",
        description: `${formData.label} has been ${sku?.id ? 'updated' : 'created'} successfully.`,
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

  const selectedProduct = products.find((p: any) => p.id === formData.product_id);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          {sku?.id ? 'Edit SKU' : 'Add New SKU'}
        </CardTitle>
        <CardDescription>
          {sku?.id ? 'Update SKU information' : 'Create a new size and pricing option'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          {!productId && (
            <div className="space-y-2">
              <Label htmlFor="product_id">Product *</Label>
              <Select
                value={formData.product_id}
                onValueChange={(value) => handleInputChange('product_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product: any) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Selected Product Info */}
          {selectedProduct && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium">{selectedProduct.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedProduct.brand}</p>
            </div>
          )}

          {/* Size Selection */}
          <div className="space-y-2">
            <Label>Size (ml) *</Label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {predefinedSizes.map(size => (
                <Button
                  key={size.ml}
                  type="button"
                  variant={formData.size_ml === size.ml ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('size_ml', size.ml)}
                  className="text-xs"
                >
                  {size.ml}ml
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={formData.size_ml}
                onChange={(e) => handleInputChange('size_ml', parseInt(e.target.value))}
                placeholder="Custom size"
                min="1"
                max="1000"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateLabel}
                className="shrink-0"
              >
                Generate Label
              </Button>
            </div>
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder="e.g., Sample 1ml, Full Size 100ml"
              required
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price (Lei) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formatPrice(formData.price)}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="0.00"
                required
              />
              <p className="text-xs text-muted-foreground">
                Stored as: {formData.price} bani
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Price per ml calculation */}
          {formData.size_ml > 0 && formData.price > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm">
                <strong>Price per ml:</strong> {(formData.price / 100 / formData.size_ml).toFixed(2)} Lei/ml
              </div>
              {formData.size_ml === 1 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Sample pricing - perfect for discovery sets
                </div>
              )}
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <Badge variant={formData.stock > 0 ? "default" : "destructive"}>
              {formData.stock > 0 ? "In Stock" : "Out of Stock"}
            </Badge>
            {formData.stock > 0 && (
              <span className="text-sm text-muted-foreground">
                {formData.stock} units available
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading || !formData.product_id}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {sku?.id ? 'Update SKU' : 'Create SKU'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SKUForm; 