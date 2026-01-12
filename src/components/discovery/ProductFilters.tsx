
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Product } from "@/types/database";

interface ProductFiltersProps {
  products: Product[];
  searchTerm: string;
  brandFilter: string;
  familyFilter: string;
  onSearchChange: (search: string) => void;
  onBrandFilterChange: (brand: string) => void;
  onFamilyFilterChange: (family: string) => void;
}

export const ProductFilters = ({ 
  products,
  searchTerm,
  brandFilter,
  familyFilter,
  onSearchChange,
  onBrandFilterChange,
  onFamilyFilterChange
}: ProductFiltersProps) => {
  const availableBrands = [...new Set(products?.map(p => p.brand) || [])];
  const availableFamilies = [...new Set(products?.map(p => p.family) || [])];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Caută parfumuri..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={brandFilter} onValueChange={onBrandFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Toate brandurile" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toate brandurile</SelectItem>
          {availableBrands.map(brand => (
            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={familyFilter} onValueChange={onFamilyFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Toate familiile" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toate familiile</SelectItem>
          {availableFamilies.map(family => (
            <SelectItem key={family} value={family}>{family}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
