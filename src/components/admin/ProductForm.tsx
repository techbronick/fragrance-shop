import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Loader2 } from 'lucide-react';
import { productUtils } from '@/utils/supabase-admin';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from "@/components/ui/checkbox";
import { Product } from "@/types/database";
import ImageUpload from '@/components/admin/ImageUpload';

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
    review_count: product?.review_count || 0
  });

  const [newNote, setNewNote] = useState({ top: '', mid: '', base: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (product?.id) {
        // Update existing product
        result = await productUtils.updateProduct(product.id, formData);
      } else {
        // Create new product
        result = await productUtils.createProduct(formData);
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: product?.id ? "Product Updated" : "Product Created",
        description: `${formData.name} has been ${product?.id ? 'updated' : 'created'} successfully.`,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{product?.id ? 'Edit Product' : 'Add New Product'}</CardTitle>
        <CardDescription>
          {product?.id ? 'Update product information' : 'Create a new luxury perfume product'}
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
              {product?.id ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm; 