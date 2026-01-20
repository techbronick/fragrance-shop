import { useRef, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Filter, Grid, List, Search, X } from "lucide-react";
import { ArrowLeft } from "@/lib/icons";
import Seo from "@/components/Seo";
import { useIsMobile } from "@/hooks/use-mobile";
import BrandCard, { BrandViewMode } from "@/components/BrandCard";
import { matchesSearch, getFirstLetter, groupByFirstLetter } from "@/utils/stringUtils";
import BrandsControlsBar from "@/components/BrandsControlsBar";
import AlphabetIndex from "@/components/AlphabetIndex";
import ProductListCard from "@/components/ProductListCard";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";


const Shop = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 24; // 6 columns x 4 rows on desktop

  // Brand search state (separate from product search)
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const debouncedBrandQuery = useDebounce(brandSearchQuery, 200);
  const brandSearchInputRef = useRef<HTMLInputElement>(null);
  
  // Refs for scroll targets
  const productsSectionRef = useRef<HTMLElement>(null);


  const { data: products, isLoading, error } = useProducts();
  const isMobile = useIsMobile();

  // Set showFilters based on device type: true on desktop, false on mobile
  useEffect(() => {
    if (isMobile !== undefined) {
      setShowFilters(!isMobile);
    }
  }, [isMobile]);

  // Brand view mode with localStorage persistence
  const BRAND_VIEW_MODE_KEY = "brandsViewMode";

  // Brand sort order

  const [brandsViewMode, setBrandsViewMode] = useState<BrandViewMode>(() => {
    // Initialize from localStorage or default to "card"
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(BRAND_VIEW_MODE_KEY);
      if (stored === "card" || stored === "compact") {
        return stored;
      }
    }
    return "card";
  });

  // Persist brand view mode changes
  const handleBrandsViewModeChange = useCallback((mode: BrandViewMode) => {
    setBrandsViewMode(mode);
    localStorage.setItem(BRAND_VIEW_MODE_KEY, mode);
  }, []);

  // Inside the component, add a helper to derive tags from products:
  const getBrandTags = (products: any[]): string[] => {
    const families = [...new Set(products.map(p => p.family).filter(Boolean))];
    return families.slice(0, 3);
  };

  // Add this useEffect for sticky shadow detection
  useEffect(() => {
    const controlsBar = document.getElementById('brands-controls-bar');
    if (!controlsBar) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        controlsBar.classList.toggle('is-sticky', entry.intersectionRatio < 1);
      },
      { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
    );

    observer.observe(controlsBar);
    return () => observer.disconnect();
  }, [showAllProducts]);

  // Initialize filters from URL params and handle browser navigation
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    const searchParam = searchParams.get('search');
    const productsParam = searchParams.get('products');
    const brandQueryParam = searchParams.get('q'); // Brand search query

    if (brandParam) {
      setSelectedBrands([brandParam]);
      setShowAllProducts(true);
    } else if (searchParam) {
      setSearchTerm(searchParam);
      setShowAllProducts(true);
    } else if (productsParam === 'all') {
      // Show all products without filters
      setSelectedBrands([]);
      setSearchTerm("");
      setShowAllProducts(true);
    } else {
      // If no parameters, show brands view
      setSelectedBrands([]);
      setSearchTerm("");
      setShowAllProducts(false);
    }

    // Sync brand search from URL
    if (brandQueryParam) {
      setBrandSearchQuery(brandQueryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when in brands view
      if (showAllProducts) return;

      // Ctrl/Cmd+K or "/" to focus search
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        brandSearchInputRef.current?.focus();
      }

      // Escape to clear search (when input is focused)
      if (e.key === 'Escape' && document.activeElement === brandSearchInputRef.current) {
        e.preventDefault();
        handleClearBrandSearch();
        brandSearchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAllProducts]);

  if (error) {
    console.error('Error loading products:', error);
  }

  const brands = [...new Set(products?.map(p => p.brand) || [])];
  const families = [...new Set(products?.map(p => p.family) || [])];

  // Group products by brand and deduplicate
  const productsByBrand = products?.reduce((acc, product) => {
    const brand = product.brand;
    if (!acc[brand]) {
      acc[brand] = [];
    }
    acc[brand].push(product);
    return acc;
  }, {} as Record<string, any[]>) || {};

  // Deduplicate products within each brand for accurate counts
  const deduplicatedProductsByBrand = Object.keys(productsByBrand).reduce((acc, brand) => {
    const seen = new Set();
    const uniqueProducts = productsByBrand[brand].filter(product => {
      const key = `${product.name}|${product.brand}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    acc[brand] = uniqueProducts;
    return acc;
  }, {} as Record<string, any[]>);

  const handleBrandClick = (brand: string) => {
    setShowFilters(false);
    setSelectedBrands([brand]);
    setShowAllProducts(true);
    setSearchParams({ brand });
    // Scroll to products section after state update
    setTimeout(() => {
      if (productsSectionRef.current) {
        const headerOffset = 80; // Header height + some padding
        const elementPosition = productsSectionRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleBrandSearchChange = useCallback((value: string) => {
    setBrandSearchQuery(value);

    // Update URL with debounced effect
    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set('q', value);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleClearBrandSearch = useCallback(() => {
    setBrandSearchQuery("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleShowAllProducts = () => {
    setShowAllProducts(true);
    setSelectedBrands([]);
    setSearchParams({});
    // Scroll to products section after state update
    setTimeout(() => {
      if (productsSectionRef.current) {
        const headerOffset = 80; // Header height + some padding
        const elementPosition = productsSectionRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleBrandFilter = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands(prev => [...prev, brand]);
    } else {
      setSelectedBrands(prev => prev.filter(b => b !== brand));
    }
  };



  const handleFamilyFilter = (family: string, checked: boolean) => {
    if (checked) {
      setSelectedFamilies(prev => [...prev, family]);
    } else {
      setSelectedFamilies(prev => prev.filter(f => f !== family));
    }
  };

  const handleGenderFilter = (gender: string, checked: boolean) => {
    if (checked) {
      setSelectedGenders(prev => [...prev, gender]);
    } else {
      setSelectedGenders(prev => prev.filter(g => g !== gender));
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedBrands([]);
    setSelectedFamilies([]);
    setSelectedGenders([]);
    setShowFilters(false);
    setSearchParams({});
  };

  // Filter products - show all if no filters are applied
  const filteredProducts = (() => {
    const filtered = products?.filter(product => {
      // If no filters are applied, show all products
      const hasFilters = searchTerm !== "" || selectedBrands.length > 0 || selectedFamilies.length > 0 || selectedGenders.length > 0;
      if (!hasFilters) return true;

      const matchesSearch = searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesFamily = selectedFamilies.length === 0 || selectedFamilies.includes(product.family);

      // For now, assume all products match gender filter since we don't have gender data
      const matchesGender = selectedGenders.length === 0 || true;

      return matchesSearch && matchesBrand && matchesFamily && matchesGender;
    }) || [];

    // Deduplicate products by name and brand combination
    const seen = new Set();
    return filtered.filter(product => {
      const key = `${product.name}|${product.brand}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBrands, selectedFamilies, selectedGenders]);

  // Scroll to top when page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = searchTerm !== "" || selectedBrands.length > 0 || selectedFamilies.length > 0 || selectedGenders.length > 0;

  // Sort brands alphabetically
  const sortedBrands = Object.keys(deduplicatedProductsByBrand).sort();

  // Add filtered brands computation (after sortedBrands line 182):
  const filteredBrands = sortedBrands.filter(brand =>
    matchesSearch(brand, debouncedBrandQuery)
  );


  const hasBrandSearchResults = filteredBrands.length > 0;


  // Group filtered brands by first letter
  const brandsByLetter = groupByFirstLetter(filteredBrands);
  // Get available letters (letters that have brands after filtering)
  const availableLetters = new Set(
    filteredBrands.map(brand => getFirstLetter(brand))
  );

  // Full alphabet for the index bar
  const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Scroll to letter section
  const scrollToLetter = useCallback((letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);


  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Shop Parfumuri Niche | Descoperă Branduri de Lux | Scent Discovery Vault"
        description="Descoperă cele mai exclusiviste parfumuri de nișă de la branduri precum Amouage, Xerjoff, Parfums de Marly, Maison Francis Kurkdjian și multe altele. Alege parfumul perfect din selecția noastră unică de lux."
        url="https://scent-discovery-vault.com/shop"
      />
      <Header />

      <main className="flex-1">

        {!showAllProducts ? (
          // ==================== BRANDS VIEW ====================
          <>
            {/* Title - scrolls away */}
            <div className="container mx-auto px-4 pt-6 pb-4">
              <h1 className="text-3xl font-playfair font-medium text-center">Branduri</h1>
            </div>

            {/* Controls Bar - STICKY */}
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">              <div className="container mx-auto px-4 py-3">
              <BrandsControlsBar
                searchQuery={brandSearchQuery}
                onSearchChange={handleBrandSearchChange}
                onClearSearch={handleClearBrandSearch}
                searchInputRef={brandSearchInputRef}
                viewMode={brandsViewMode}
                onViewModeChange={handleBrandsViewModeChange}
                onViewAllProducts={handleShowAllProducts}
              />
            </div>
            </div>

            {/* A-Z Index - STICKY */}
            {hasBrandSearchResults && (
              <div className="sticky top-[116px] z-30 bg-background/95 backdrop-blur-sm border-b border-border">                <div className="container mx-auto px-4 py-2">
                <AlphabetIndex
                  availableLetters={availableLetters}
                  onLetterClick={scrollToLetter}
                  activeLetter={null}
                />
              </div>
              </div>
            )}

            {/* Content */}
            <div className="container mx-auto px-4 py-6">
              {hasBrandSearchResults ? (
                <>
                  {debouncedBrandQuery && (
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      {filteredBrands.length} {filteredBrands.length === 1 ? 'brand găsit' : 'branduri găsite'}
                    </p>
                  )}

                  <div className="space-y-8">
                    {alphabet.map((letter) => {
                      const brandsInLetter = brandsByLetter.get(letter) || [];
                      if (brandsInLetter.length === 0) return null;

                      return (
                        <section key={letter} id={`letter-${letter}`} className="scroll-mt-40">
                          <h2 className="text-2xl font-playfair font-semibold mb-4 pb-2 border-b border-border">
                            {letter}
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                              ({brandsInLetter.length})
                            </span>
                          </h2>
                          <div className={brandsViewMode === "compact" ? "brand-compact-grid" : "brand-card-grid"}>
                            {brandsInLetter.map((brand) => (
                              <BrandCard
                                key={brand}
                                brand={brand}
                                productCount={deduplicatedProductsByBrand[brand]?.length || 0}
                                tags={getBrandTags(deduplicatedProductsByBrand[brand] || [])}
                                onClick={() => handleBrandClick(brand)}
                                viewMode={brandsViewMode}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center" role="status" aria-live="polite">
                  <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-medium mb-2">Niciun brand găsit</h2>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    Nu am găsit niciun brand care să corespundă cu "{brandSearchQuery}".
                  </p>
                  <Button variant="outline" onClick={handleClearBrandSearch}>
                    Șterge căutarea
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          // Products View
          <>
            <section ref={productsSectionRef} className="scroll-mt-20">
              <div className="container mx-auto px-4 py-8">
                {/* Controls Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filtre
                      </Button>

                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="flex items-center text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Șterge filtrele
                        </Button>
                      )}

                      <Select defaultValue="featured">
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="featured">Recomandate</SelectItem>
                          <SelectItem value="price-low">Preț: Mic la Mare</SelectItem>
                          <SelectItem value="price-high">Preț: Mare la Mic</SelectItem>
                          <SelectItem value="name">Nume A-Z</SelectItem>
                          <SelectItem value="newest">Cele Mai Noi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Search Bar - always visible */}
                    <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Caută parfumuri..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {filteredProducts.length} produse
                    </span>
                    <div className="flex border border-border rounded-lg">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-none"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-8">
                  {/* Filters Overlay - mobile only */}
                  {showFilters && isMobile ? (
                    <div className="fixed left-0 right-0 top-16 h-[calc(100vh-4rem)] z-50 bg-background flex flex-col overflow-y-auto">
                      {/* Header with back button */}
                      <div className="sticky top-0 bg-background border-b border-border z-10 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowFilters(false)}
                              className="p-2"
                            >
                              <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h3 className="text-lg font-medium">Filtre</h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(false)}
                            className="p-2"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Filter content */}
                      <div className="flex-1 p-4">
                        <aside className="space-y-6">
                          {/* Search */}
                          <div className="space-y-4">
                            <h3 className="font-medium">Căutare</h3>
                            <div className="relative">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Caută parfumuri..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          {/* Brands */}
                          <div className="space-y-4">
                            <h3 className="font-medium">Marcă</h3>
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                              {brands.map((brand) => (
                                <div key={brand} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`brand-mobile-${brand}`}
                                    checked={selectedBrands.includes(brand)}
                                    onCheckedChange={(checked) => handleBrandFilter(brand, !!checked)}
                                  />
                                  <label
                                    htmlFor={`brand-mobile-${brand}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {brand}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Families */}
                          <div className="space-y-4">
                            <h3 className="font-medium">Familia Parfumului</h3>
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                              {families.map((family) => (
                                <div key={family} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`family-mobile-${family}`}
                                    checked={selectedFamilies.includes(family)}
                                    onCheckedChange={(checked) => handleFamilyFilter(family, !!checked)}
                                  />
                                  <label
                                    htmlFor={`family-mobile-${family}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {family}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Gender */}
                          <div className="space-y-4">
                            <h3 className="font-medium">Gen</h3>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="unisex-mobile"
                                  checked={selectedGenders.includes("unisex")}
                                  onCheckedChange={(checked) => handleGenderFilter("unisex", !!checked)}
                                />
                                <label htmlFor="unisex-mobile" className="text-sm cursor-pointer">
                                  Unisex
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="feminine-mobile"
                                  checked={selectedGenders.includes("feminine")}
                                  onCheckedChange={(checked) => handleGenderFilter("feminine", !!checked)}
                                />
                                <label htmlFor="feminine-mobile" className="text-sm cursor-pointer">
                                  Feminin
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="masculine-mobile"
                                  checked={selectedGenders.includes("masculine")}
                                  onCheckedChange={(checked) => handleGenderFilter("masculine", !!checked)}
                                />
                                <label htmlFor="masculine-mobile" className="text-sm cursor-pointer">
                                  Masculin
                                </label>
                              </div>
                            </div>
                          </div>
                        </aside>
                      </div>
                    </div>
                  ) : null}

                  {/* Filters Sidebar - desktop only */}
                  {showFilters && !isMobile ? (
                    <aside className="w-64 space-y-6">
                      {/* Search */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Căutare</h3>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Caută parfumuri..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Brands */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Marcă</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {brands.map((brand) => (
                            <div key={brand} className="flex items-center space-x-2">
                              <Checkbox
                                id={`brand-${brand}`}
                                checked={selectedBrands.includes(brand)}
                                onCheckedChange={(checked) => handleBrandFilter(brand, !!checked)}
                              />
                              <label
                                htmlFor={`brand-${brand}`}
                                className="text-sm cursor-pointer"
                              >
                                {brand}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Families */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Familia Parfumului</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {families.map((family) => (
                            <div key={family} className="flex items-center space-x-2">
                              <Checkbox
                                id={`family-${family}`}
                                checked={selectedFamilies.includes(family)}
                                onCheckedChange={(checked) => handleFamilyFilter(family, !!checked)}
                              />
                              <label
                                htmlFor={`family-${family}`}
                                className="text-sm cursor-pointer"
                              >
                                {family}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Gen</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="unisex"
                              checked={selectedGenders.includes("unisex")}
                              onCheckedChange={(checked) => handleGenderFilter("unisex", !!checked)}
                            />
                            <label htmlFor="unisex" className="text-sm cursor-pointer">
                              Unisex
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="feminine"
                              checked={selectedGenders.includes("feminine")}
                              onCheckedChange={(checked) => handleGenderFilter("feminine", !!checked)}
                            />
                            <label htmlFor="feminine" className="text-sm cursor-pointer">
                              Feminin
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="masculine"
                              checked={selectedGenders.includes("masculine")}
                              onCheckedChange={(checked) => handleGenderFilter("masculine", !!checked)}
                            />
                            <label htmlFor="masculine" className="text-sm cursor-pointer">
                              Masculin
                            </label>
                          </div>
                        </div>
                      </div>
                    </aside>
                  ) : null}

                  {/* Products Grid */}
                  <div className="flex-1">
                    {isLoading ? (
                      <div className={`grid ${viewMode === "grid"
                        ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2"
                        : "grid-cols-1 gap-8"
                        }`}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-6 bg-muted rounded w-full"></div>
                              <div className="h-4 bg-muted rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      viewMode === "grid" ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {paginatedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      ) : (
                        // LIST VIEW
                        <div className="flex flex-col gap-4">
                          {paginatedProducts.map((product) => (
                            <ProductListCard key={product.id} product={product} />
                          ))}
                        </div>
                      )
                    )}
                  </div>

                </div>
                {/* Pagination */}
{totalPages > 1 && (
  <div className="mt-8 mb-4">
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {/* First page */}
        {currentPage > 2 && (
          <PaginationItem>
            <PaginationLink onClick={() => handlePageChange(1)} className="cursor-pointer">
              1
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Ellipsis before */}
        {currentPage > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Page before current */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => handlePageChange(currentPage - 1)} className="cursor-pointer">
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Current page */}
        <PaginationItem>
          <PaginationLink isActive className="cursor-default">
            {currentPage}
          </PaginationLink>
        </PaginationItem>

        {/* Page after current */}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationLink onClick={() => handlePageChange(currentPage + 1)} className="cursor-pointer">
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Ellipsis after */}
        {currentPage < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Last page */}
        {currentPage < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => handlePageChange(totalPages)} className="cursor-pointer">
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>

    <p className="text-center text-sm text-muted-foreground mt-2">
      Pagina {currentPage} din {totalPages} ({filteredProducts.length} produse)
    </p>
  </div>
)}
              </div>
            </section>
          </>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Shop;
