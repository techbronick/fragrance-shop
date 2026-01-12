
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, DiscoverySetConfig } from "@/types/database";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";

interface DiscoveryProductSelectorProps {
  products: Product[];
  selectedConfig: DiscoverySetConfig;
  selectedProducts: Array<{ product: Product; slotIndex: number }>;
  searchTerm: string;
  brandFilter: string;
  familyFilter: string;
  onSearchChange: (search: string) => void;
  onBrandFilterChange: (brand: string) => void;
  onFamilyFilterChange: (family: string) => void;
  onAddProduct: (product: Product, slotIndex: number) => void;
}

export const DiscoveryProductSelector = ({ 
  products,
  selectedConfig,
  selectedProducts,
  searchTerm,
  brandFilter,
  familyFilter,
  onSearchChange,
  onBrandFilterChange,
  onFamilyFilterChange,
  onAddProduct
}: DiscoveryProductSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selectează Parfumuri</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductFilters 
          products={products}
          searchTerm={searchTerm}
          brandFilter={brandFilter}
          familyFilter={familyFilter}
          onSearchChange={onSearchChange}
          onBrandFilterChange={onBrandFilterChange}
          onFamilyFilterChange={onFamilyFilterChange}
        />

        <ProductGrid 
          products={products}
          selectedConfig={selectedConfig}
          selectedProducts={selectedProducts}
          searchTerm={searchTerm}
          brandFilter={brandFilter}
          familyFilter={familyFilter}
          onAddProduct={onAddProduct}
        />
      </CardContent>
    </Card>
  );
};
