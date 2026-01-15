import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/admin/ImageUpload';
import { supabaseAdmin } from '@/utils/supabase-admin';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Plus, X } from 'lucide-react';

// Store brand images in a simple JSON structure
// We'll use a storage file or a simple config approach
// For now, using localStorage as a simple solution - you can migrate to a table later
const BRAND_IMAGES_STORAGE_KEY = 'brand_images_config';

interface BrandImageConfig {
  [brandName: string]: string;
}

const BrandImageManager: React.FC = () => {
  const { toast } = useToast();
  const [brands, setBrands] = useState<string[]>([]);
  const [brandImages, setBrandImages] = useState<BrandImageConfig>({});
  const [newBrand, setNewBrand] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch unique brands from products
  useEffect(() => {
    const fetchBrands = async () => {
      setFetching(true);
      try {
        const { data, error } = await supabaseAdmin
          .from('products')
          .select('brand')
          .order('brand');

        if (!error && data) {
          const uniqueBrands = Array.from(new Set(data.map(p => p.brand).filter(Boolean)));
          setBrands(uniqueBrands);
        }

        // Load saved brand images from localStorage
        const savedImages = localStorage.getItem(BRAND_IMAGES_STORAGE_KEY);
        if (savedImages) {
          try {
            const parsed = JSON.parse(savedImages);
            setBrandImages(parsed);
          } catch (e) {
            console.error('Error parsing saved brand images:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        toast({
          title: 'Error',
          description: 'Failed to load brands',
          variant: 'destructive'
        });
      } finally {
        setFetching(false);
      }
    };
    fetchBrands();
  }, [toast]);

  const handleBrandImageChange = (brandName: string, imageUrl: string) => {
    setBrandImages(prev => ({
      ...prev,
      [brandName]: imageUrl
    }));
  };

  const handleAddBrand = () => {
    const trimmedBrand = newBrand.trim();
    if (trimmedBrand && !brands.includes(trimmedBrand)) {
      setBrands(prev => [...prev, trimmedBrand].sort());
      setNewBrand('');
    }
  };

  const handleRemoveBrand = (brandName: string) => {
    setBrands(prev => prev.filter(b => b !== brandName));
    setBrandImages(prev => {
      const updated = { ...prev };
      delete updated[brandName];
      return updated;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage (you can migrate this to a database table later)
      localStorage.setItem(BRAND_IMAGES_STORAGE_KEY, JSON.stringify(brandImages));
      
      toast({
        title: 'Brand images saved',
        description: 'Brand image configurations have been saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save brand images',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading brands...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Image Management</CardTitle>
        <CardDescription>
          Upload and manage brand logo images. These will be used across the site.
          Images are stored in the brand-images storage bucket.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new brand */}
        <div className="flex gap-2 p-4 border rounded-lg bg-muted/50">
          <Input
            placeholder="Add new brand name..."
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
          />
          <Button onClick={handleAddBrand} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Brand
          </Button>
        </div>

        {/* Brand list */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {brands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No brands found. Add a brand above or create products first.
            </div>
          ) : (
            brands.map(brand => (
              <div key={brand} className="space-y-2 p-4 border rounded-lg bg-background">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">{brand}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBrand(brand)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ImageUpload
                  value={brandImages[brand] || ''}
                  onChange={(url) => handleBrandImageChange(brand, url)}
                  bucket="brand-images"
                  label="Brand Logo"
                  fileName={brand.toLowerCase().replace(/\s+/g, '-')}
                />
              </div>
            ))
          )}
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Brand Images
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandImageManager;

// Export utility function to get brand image URL
export const getBrandImageUrl = (brandName: string): string | null => {
  try {
    const savedImages = localStorage.getItem(BRAND_IMAGES_STORAGE_KEY);
    if (savedImages) {
      const parsed = JSON.parse(savedImages);
      return parsed[brandName] || null;
    }
  } catch (e) {
    console.error('Error getting brand image:', e);
  }
  return null;
};
