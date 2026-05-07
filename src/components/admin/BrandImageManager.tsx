import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/admin/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, Image as ImageIcon, Search } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { matchesSearch } from '@/utils/stringUtils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface BrandWithImage {
  name: string;
  imageUrl: string | null;
  productCount: number;
}

const BrandImageManager: React.FC = () => {
  const { toast } = useToast();
  const [brands, setBrands] = useState<BrandWithImage[]>([]);
  const [brandImages, setBrandImages] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [fetching, setFetching] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 20;

  // Fetch unique brands from products and their images from storage
  useEffect(() => {
    const fetchBrands = async () => {
      setFetching(true);
      try {
        // Fetch ALL products with pagination to get unique brands
        let allProducts: any[] = [];
        let from = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from('products')
            .select('brand')
            .order('brand')
            .range(from, from + pageSize - 1);

          if (error) {
            throw error;
          }

          if (data && data.length > 0) {
            allProducts = [...allProducts, ...data];
            from += pageSize;
            hasMore = data.length === pageSize;
          } else {
            hasMore = false;
          }
        }

        if (allProducts.length > 0) {
          // Get unique brands with product counts
          const brandMap = new Map<string, number>();
          allProducts.forEach(p => {
            if (p.brand) {
              brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
            }
          });

          const uniqueBrands = Array.from(brandMap.entries())
            .map(([name, count]) => ({ name, productCount: count }))
            .sort((a, b) => a.name.localeCompare(b.name));

          // Fetch existing images from storage for each brand
          const brandsWithImages: BrandWithImage[] = await Promise.all(
            uniqueBrands.map(async (brand) => {
              // Try to get image from storage using the expected naming pattern
              const fileName = `${brand.name}.webp`;
              const { data: urlData } = supabase.storage
                .from('brand-images')
                .getPublicUrl(fileName);

              // Check if file actually exists by trying to fetch it
              let imageUrl: string | null = null;
              try {
                const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
                if (response.ok) {
                  imageUrl = urlData.publicUrl;
                }
              } catch (e) {
                // File doesn't exist, imageUrl stays null
              }

              return {
                name: brand.name,
                imageUrl,
                productCount: brand.productCount
              };
            })
          );

          setBrands(brandsWithImages);
          
          // Initialize brandImages state with existing URLs
          const imagesMap: Record<string, string> = {};
          brandsWithImages.forEach(brand => {
            if (brand.imageUrl) {
              imagesMap[brand.name] = brand.imageUrl;
            }
          });
          setBrandImages(imagesMap);
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

  // Filter brands based on search query
  const filteredBrands = brands.filter(brand =>
    matchesSearch(brand.name, searchQuery)
  );

  // Pagination
  const totalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination component helper
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {currentPage > 2 && (
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)} className="cursor-pointer">
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {currentPage > 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(currentPage - 1)} className="cursor-pointer">
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink isActive className="cursor-default">
                {currentPage}
              </PaginationLink>
            </PaginationItem>

            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(currentPage + 1)} className="cursor-pointer">
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {currentPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)} className="cursor-pointer">
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Showing {paginatedBrands.length} of {filteredBrands.length} brands (Page {currentPage} of {totalPages})
        </p>
      </div>
    );
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
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brands by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Brand list with images */}
        <div className="space-y-4">
          {filteredBrands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No brands match your search.' : 'No brands found. Create products first.'}
            </div>
          ) : (
            paginatedBrands.map(brand => {
              const currentImageUrl = brandImages[brand.name] || brand.imageUrl;
              
              return (
                <div key={brand.name} className="p-4 border rounded-lg bg-background space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Label className="text-base font-medium">{brand.name}</Label>
                      <span className="text-sm text-muted-foreground">
                        ({brand.productCount} {brand.productCount === 1 ? 'product' : 'products'})
                      </span>
                    </div>
                  </div>

                  {/* Display current image */}
                  <div className="flex items-start gap-4">
                    {currentImageUrl ? (
                      <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <OptimizedImage
                          src={currentImageUrl}
                          alt={brand.name}
                          className="w-full h-full object-cover"
                          width={128}
                          height={128}
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 border rounded-lg flex items-center justify-center bg-muted flex-shrink-0">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Upload component */}
                    <div className="flex-1">
                      <ImageUpload
                        value={currentImageUrl || ''}
                        onChange={(url) => handleBrandImageChange(brand.name, url)}
                        bucket="brand-images"
                        label="Brand Logo"
                        fileName={brand.name}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Image will be saved as: <code className="text-xs bg-muted px-1 py-0.5 rounded">{brand.name}.webp</code>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {renderPagination()}
      </CardContent>
    </Card>
  );
};

export default BrandImageManager;
