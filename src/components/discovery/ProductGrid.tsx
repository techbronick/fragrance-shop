import { useState, useEffect } from "react";
import { Product, DiscoverySetConfig } from "@/types/database";
import { DiscoveryProductCard } from "./DiscoveryProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface ProductGridProps {
  products: Product[];
  selectedConfig: DiscoverySetConfig;
  selectedProducts: Array<{ product: Product; slotIndex: number }>;
  searchTerm: string;
  brandFilter: string;
  familyFilter: string;
  onAddProduct: (product: Product, slotIndex: number) => void;
}

const PRODUCTS_PER_PAGE = 18;

export const ProductGrid = ({ 
  products,
  selectedConfig,
  selectedProducts,
  searchTerm,
  brandFilter,
  familyFilter,
  onAddProduct
}: ProductGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const generateSlots = () => {
    const slots: Array<{ slotIndex: number; volumeMl: number }> = [];
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

  const getFirstAvailableSlot = () => {
    const allSlots = generateSlots();
    return allSlots.find(slot => !getProductInSlot(slot.slotIndex));
  };

  const handleAddProduct = (product: Product) => {
    console.log('ProductGrid handleAddProduct called:', product.name);
    const availableSlot = getFirstAvailableSlot();
    console.log('Available slot found:', availableSlot);
    if (availableSlot) {
      onAddProduct(product, availableSlot.slotIndex);
    }
  };

  const filteredProducts = (() => {
    const filtered = products?.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = !brandFilter || brandFilter === "all" || product.brand === brandFilter;
      const matchesFamily = !familyFilter || familyFilter === "all" || product.family === familyFilter;
      return matchesSearch && matchesBrand && matchesFamily;
    }) || [];

    const seen = new Set();
    return filtered.filter(product => {
      const key = `${product.name}|${product.brand}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, brandFilter, familyFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const hasAvailableSlots = !!getFirstAvailableSlot();

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredProducts.length} parfumuri găsite
        {totalPages > 1 && ` • Pagina ${currentPage} din ${totalPages}`}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {paginatedProducts.map(product => (
          <DiscoveryProductCard 
            key={product.id}
            product={product}
            hasAvailableSlots={hasAvailableSlots}
            onAddProduct={handleAddProduct}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
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
        </div>
      )}

      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Niciun parfum găsit. Încearcă să modifici filtrele.
        </div>
      )}
    </div>
  );
};