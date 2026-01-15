import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import {
  testConnections,
  exploreDatabase,
  getStats,
  productUtils,
  skuUtils,
  discoverySetUtils
} from '@/utils/supabase-admin';
import { Database, Activity, Package, Settings, Users, Zap, Plus, Edit, Trash2, Eye, DollarSign, Wine, TestTube, Search, X, LogOut, Image } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import SKUForm from '@/components/admin/SKUForm';
import DiscoverySetForm from '@/components/admin/DiscoverySetForm';
import OrdersList from '@/components/admin/OrdersList';
import BrandImageManager from '@/components/admin/BrandImageManager';
import { useToast } from '@/hooks/use-toast';
import { matchesSearch } from '@/utils/stringUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const [dbExploration, setDbExploration] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [skus, setSkus] = useState<any[]>([]);
  const [discoveryConfigs, setDiscoveryConfigs] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSKU, setSelectedSKU] = useState<any>(null);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showSKUForm, setShowSKUForm] = useState(false);
  const [showDiscoveryForm, setShowDiscoveryForm] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [bottleSearchQuery, setBottleSearchQuery] = useState('');
  const [sampleSearchQuery, setSampleSearchQuery] = useState('');
  const [discoverySearchQuery, setDiscoverySearchQuery] = useState('');
  
  // Pagination state
  const [productsPage, setProductsPage] = useState(1);
  const [bottlesPage, setBottlesPage] = useState(1);
  const [samplesPage, setSamplesPage] = useState(1);
  const [discoveryPage, setDiscoveryPage] = useState(1);
  
  const ITEMS_PER_PAGE = 20;

  // Sync tab with URL params
  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    handleTestConnection();
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      handleLoadProducts(),
      handleLoadSkus(),
      handleLoadDiscoveryConfigs()
    ]);
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const result = await testConnections();
      setConnectionStatus(result);

      if (result.stats) {
        setDbStats(result.stats);
      }
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExploreDatabase = async () => {
    setLoading(true);
    try {
      const result = await exploreDatabase();
      setDbExploration(result);
    } catch (error) {
      console.error('Exploration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadProducts = async () => {
    try {
      const { data, error } = await productUtils.getAllProducts();
      if (error) {
        console.error('Error loading products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleLoadSkus = async () => {
    try {
      const { data, error } = await skuUtils.getAllSKUs();
      if (error) {
        console.error('Error loading SKUs:', error);
      } else {
        setSkus(data || []);
      }
    } catch (error) {
      console.error('Failed to load SKUs:', error);
    }
  };

  const handleLoadDiscoveryConfigs = async () => {
    try {
      const { data, error } = await discoverySetUtils.getConfigs();
      if (error) {
        console.error('Error loading discovery configs:', error);
      } else {
        setDiscoveryConfigs(data || []);
      }
    } catch (error) {
      console.error('Failed to load discovery configs:', error);
    }
  };

  const handleProductFormSuccess = () => {
    setShowProductForm(false);
    setSelectedProduct(null);
    handleLoadProducts();
    handleTestConnection(); // Refresh stats
  };

  const handleSKUFormSuccess = () => {
    setShowSKUForm(false);
    setSelectedSKU(null);
    handleLoadSkus();
    handleTestConnection(); // Refresh stats
  };

  const handleDiscoveryFormSuccess = () => {
    setShowDiscoveryForm(false);
    setSelectedConfig(null);
    handleLoadDiscoveryConfigs();
    handleTestConnection(); // Refresh stats
  };

  const formatPrice = (priceInBani: number) => {
    return (priceInBani / 100).toFixed(2);
  };

  // Delete handlers
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This will also delete all associated SKUs.')) {
      return;
    }
    try {
      const { error } = await productUtils.deleteProduct(productId);
      if (error) throw error;
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
      handleLoadProducts();
      handleTestConnection();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSKU = async (skuId: string) => {
    if (!confirm('Are you sure you want to delete this SKU?')) {
      return;
    }
    try {
      const { error } = await skuUtils.deleteSKU(skuId);
      if (error) throw error;
      toast({
        title: "SKU Deleted",
        description: "SKU has been deleted successfully.",
      });
      handleLoadSkus();
      handleTestConnection();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete SKU",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this discovery set configuration?')) {
      return;
    }
    try {
      const { error } = await discoverySetUtils.deleteConfig(configId);
      if (error) throw error;
      toast({
        title: "Config Deleted",
        description: "Discovery set configuration has been deleted successfully.",
      });
      handleLoadDiscoveryConfigs();
      handleTestConnection();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete configuration",
        variant: "destructive",
      });
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => 
    matchesSearch(p.name, productSearchQuery) || 
    matchesSearch(p.brand, productSearchQuery)
  );

  // Group products by brand (using filtered products)
  const productsByBrand = filteredProducts.reduce((acc, product) => {
    const brand = product.brand;
    if (!acc[brand]) {
      acc[brand] = [];
    }
    acc[brand].push(product);
    return acc;
  }, {} as Record<string, any[]>);

  // Separate SKUs into bottles and samples
  const bottleSKUs = skus.filter(sku => sku.size_ml >= 10); // 10ml and above are bottles
  const sampleSKUs = skus.filter(sku => sku.size_ml < 10); // Under 10ml are samples

  // Filter functions (after bottleSKUs and sampleSKUs are declared)
  const filteredBottleSKUs = bottleSKUs.filter(sku => 
    matchesSearch(sku.products?.name || '', bottleSearchQuery) ||
    matchesSearch(sku.products?.brand || '', bottleSearchQuery) ||
    matchesSearch(sku.label || '', bottleSearchQuery)
  );

  const filteredSampleSKUs = sampleSKUs.filter(sku => 
    matchesSearch(sku.products?.name || '', sampleSearchQuery) ||
    matchesSearch(sku.products?.brand || '', sampleSearchQuery) ||
    matchesSearch(sku.label || '', sampleSearchQuery)
  );

  const filteredDiscoveryConfigs = discoveryConfigs.filter(config =>
    matchesSearch(config.name, discoverySearchQuery) ||
    matchesSearch(config.description || '', discoverySearchQuery)
  );

  // Group bottle SKUs by size
  const bottlesBySize = bottleSKUs.reduce((acc, sku) => {
    const size = `${sku.size_ml}ml`;
    if (!acc[size]) {
      acc[size] = [];
    }
    acc[size].push(sku);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort brands alphabetically
  const sortedBrands = Object.keys(productsByBrand).sort();
  
  // Pagination for products (by brand)
  const productsTotalPages = Math.ceil(sortedBrands.length / ITEMS_PER_PAGE);
  const paginatedBrands = sortedBrands.slice(
    (productsPage - 1) * ITEMS_PER_PAGE,
    productsPage * ITEMS_PER_PAGE
  );
  
  // Pagination for bottles
  const bottlesByBrand = filteredBottleSKUs.reduce((acc, sku) => {
    const brand = sku.products?.brand || 'Unknown';
    if (!acc[brand]) acc[brand] = [];
    acc[brand].push(sku);
    return acc;
  }, {} as Record<string, any[]>);
  const sortedBottleBrands = Object.keys(bottlesByBrand).sort((a, b) => a.localeCompare(b));
  const bottlesTotalPages = Math.ceil(sortedBottleBrands.length / ITEMS_PER_PAGE);
  const paginatedBottleBrands = sortedBottleBrands.slice(
    (bottlesPage - 1) * ITEMS_PER_PAGE,
    bottlesPage * ITEMS_PER_PAGE
  );
  
  // Pagination for samples
  const samplesTotalPages = Math.ceil(filteredSampleSKUs.length / ITEMS_PER_PAGE);
  const paginatedSamples = filteredSampleSKUs.slice(
    (samplesPage - 1) * ITEMS_PER_PAGE,
    samplesPage * ITEMS_PER_PAGE
  );
  
  // Pagination for discovery sets
  const discoveryTotalPages = Math.ceil(filteredDiscoveryConfigs.length / ITEMS_PER_PAGE);
  const paginatedDiscoveryConfigs = filteredDiscoveryConfigs.slice(
    (discoveryPage - 1) * ITEMS_PER_PAGE,
    discoveryPage * ITEMS_PER_PAGE
  );

  // Sort bottle sizes numerically
  const sortedBottleSizes = Object.keys(bottlesBySize).sort((a, b) => {
    const sizeA = parseInt(a.replace('ml', ''));
    const sizeB = parseInt(b.replace('ml', ''));
    return sizeA - sizeB;
  });
  
  // Reset pagination when search changes
  useEffect(() => {
    setProductsPage(1);
  }, [productSearchQuery]);
  
  useEffect(() => {
    setBottlesPage(1);
  }, [bottleSearchQuery]);
  
  useEffect(() => {
    setSamplesPage(1);
  }, [sampleSearchQuery]);
  
  useEffect(() => {
    setDiscoveryPage(1);
  }, [discoverySearchQuery]);
  
  // Pagination handlers
  const handleProductsPageChange = (page: number) => {
    setProductsPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleBottlesPageChange = (page: number) => {
    setBottlesPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSamplesPageChange = (page: number) => {
    setSamplesPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDiscoveryPageChange = (page: number) => {
    setDiscoveryPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Pagination component helper
  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void,
    showing: number,
    total: number
  ) => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {currentPage > 2 && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(1)} className="cursor-pointer">
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
                <PaginationLink onClick={() => onPageChange(currentPage - 1)} className="cursor-pointer">
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
                <PaginationLink onClick={() => onPageChange(currentPage + 1)} className="cursor-pointer">
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
                <PaginationLink onClick={() => onPageChange(totalPages)} className="cursor-pointer">
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Showing {showing} of {total} items (Page {currentPage} of {totalPages})
        </p>
      </div>
    );
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Scent Discovery Vault Admin</h1>
            <p className="text-muted-foreground">
              Complete database management and content creation tools
            </p>
            {user && (
              <p className="text-sm text-muted-foreground mt-1">
                Logged in as: {user.email}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="bottles">Bottles</TabsTrigger>
            <TabsTrigger value="samples">Samples</TabsTrigger>
            <TabsTrigger value="discovery">Discovery Sets</TabsTrigger>
            <TabsTrigger value="brands">Brands</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Database connections and system health
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    onClick={handleTestConnection}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Database className="h-4 w-4" />
                    Test Connections
                  </Button>
                  <Button
                    onClick={handleExploreDatabase}
                    disabled={loading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    Explore Database
                  </Button>
                </div>

                {connectionStatus && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={connectionStatus.anonSuccess ? "default" : "destructive"}>
                          {connectionStatus.anonSuccess ? "✅ Connected" : "❌ Failed"}
                        </Badge>
                        <span className="font-medium">Frontend Client</span>
                      </div>
                      {connectionStatus.errors?.anon && (
                        <p className="text-sm text-red-500">{connectionStatus.errors.anon}</p>
                      )}
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={connectionStatus.adminSuccess ? "default" : "destructive"}>
                          {connectionStatus.adminSuccess ? "✅ Connected" : "❌ Failed"}
                        </Badge>
                        <span className="font-medium">Admin Client</span>
                      </div>
                      {connectionStatus.errors?.admin && (
                        <p className="text-sm text-red-500">{connectionStatus.errors.admin}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Database Statistics */}
            {dbStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Inventory Overview
                  </CardTitle>
                  <CardDescription>Real-time statistics from your Supabase database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{dbStats.products}</div>
                      <div className="text-sm text-muted-foreground">Products</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{bottleSKUs.length}</div>
                      <div className="text-sm text-muted-foreground">Bottle SKUs</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">{sampleSKUs.length}</div>
                      <div className="text-sm text-muted-foreground">Sample SKUs</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{dbStats.discoveryConfigs}</div>
                      <div className="text-sm text-muted-foreground">Discovery Configs</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{dbStats.discoveryConfigItems}</div>
                      <div className="text-sm text-muted-foreground">Config Items</div>
                    </div>
                    <div className="text-center p-4 bg-rose-50 dark:bg-rose-950 rounded-lg">
                      <div className="text-2xl font-bold text-rose-600">{sortedBrands.length}</div>
                      <div className="text-sm text-muted-foreground">Brands</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => {
                      setSelectedProduct(null);  // ADD THIS
                      setShowProductForm(true);
                    }}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Package className="h-6 w-6" />
                    <span>Add New Product</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedSKU(null);  // ADD THIS
                      setShowSKUForm(true);
                    }}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Wine className="h-6 w-6" />
                    <span>Add Bottle SKU</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedSKU(null);  // ADD THIS
                      setShowSKUForm(true);
                    }}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <TestTube className="h-6 w-6" />
                    <span>Add Sample SKU</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedConfig(null);  // ADD THIS
                      setShowDiscoveryForm(true);
                    }}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Users className="h-6 w-6" />
                    <span>Create Discovery Set</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrdersList />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Products by Brand
                    </CardTitle>
                    <CardDescription>
                      {filteredProducts.length} of {products.length} products
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedProduct(null);
                      setShowProductForm(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products by name or brand..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {productSearchQuery && (
                      <button
                        onClick={() => setProductSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>
                {paginatedBrands.length > 0 ? (
                  <Accordion type="multiple" className="space-y-2">
                    {paginatedBrands.map((brand) => (
                      <AccordionItem key={brand} value={brand} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-lg">{brand}</span>
                            <Badge variant="secondary">{productsByBrand[brand].length} products</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="space-y-3">
                            {productsByBrand[brand].map((product) => (
                              <div key={product.id} className="p-4 bg-muted rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-medium text-lg">{product.name}</h4>
                                      <Badge variant="outline">{product.family}</Badge>
                                      <Badge variant="outline">{product.concentration}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                      {product.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm">
                                      <span>⭐ {product.rating}/5 ({product.review_count} reviews)</span>
                                      <span>{product.launch_year}</span>
                                      {product.gender_neutral && <Badge variant="outline">Unisex</Badge>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedProduct(product);
                                        setShowProductForm(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedSKU({ product_id: product.id });
                                        setShowSKUForm(true);
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                      SKU
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteProduct(product.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No products found. Create your first product!</p>
                    <Button
                      onClick={() => {
                        setSelectedProduct(null);
                        setShowProductForm(true);
                      }}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Product
                    </Button>
                  </div>
                )}
                
                {renderPagination(
                  productsPage,
                  productsTotalPages,
                  handleProductsPageChange,
                  paginatedBrands.length,
                  sortedBrands.length
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bottles" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Wine className="h-5 w-5" />
                      Bottle Inventory Management
                    </CardTitle>
                    <CardDescription>
                      Track bottle inventory and sample packaging options with pricing
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedSKU(null);
                      setShowSKUForm(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Bottle Stock
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search bottles by product, brand, or label..."
                      value={bottleSearchQuery}
                      onChange={(e) => setBottleSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {bottleSearchQuery && (
                      <button
                        onClick={() => setBottleSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                {paginatedBottleBrands.length > 0 ? (
                  <div className="space-y-6">
                    {/* Group by Brand first */}
                    {paginatedBottleBrands.map((brand) => {
                      const brandSKUs = bottlesByBrand[brand];
                      return (
                      <div key={brand} className="border rounded-lg p-4">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          {brand}
                          <Badge variant="secondary">{brandSKUs.length} bottle types</Badge>
                        </h3>

                        <div className="space-y-4">
                          {brandSKUs.map((sku) => {
                            // Realistic inventory numbers
                            const newBottles = Math.min(2, Math.max(1, Math.floor(sku.stock * 0.3))); // 1-2 new bottles
                            const openedBottles = sku.stock > newBottles ? 1 : 0; // Usually 1 opened bottle
                            const remainingMl = openedBottles > 0 ? Math.floor(Math.random() * (sku.size_ml - 15) + 15) : 0; // Random remaining ml

                            // Sample pricing calculations (approximate Lei per ml based on product value)
                            const basePricePerMl = sku.price / 100 / sku.size_ml; // Original price per ml
                            const samplePricePerMl = Math.ceil(basePricePerMl * 1.5); // 50% markup for samples

                            // Sample packaging options
                            const packagingOptions = [];

                            if (remainingMl >= 10) {
                              // Option 1: Mix of 10ml and remainder
                              const tenMlCount = Math.floor(remainingMl / 10);
                              const remainder1 = remainingMl % 10;
                              const option1Price = (tenMlCount * 10 * samplePricePerMl) + (remainder1 * samplePricePerMl * 1.2);
                              packagingOptions.push({
                                id: 1,
                                description: remainder1 > 0 ? `${tenMlCount}×10ml + 1×${remainder1}ml` : `${tenMlCount}×10ml`,
                                price: Math.round(option1Price),
                                totalMl: remainingMl
                              });
                            }

                            if (remainingMl >= 5) {
                              // Option 2: Mix of 5ml and remainder
                              const fiveMlCount = Math.floor(remainingMl / 5);
                              const remainder2 = remainingMl % 5;
                              const option2Price = (fiveMlCount * 5 * samplePricePerMl * 1.1) + (remainder2 * samplePricePerMl * 1.3);
                              packagingOptions.push({
                                id: 2,
                                description: remainder2 > 0 ? `${fiveMlCount}×5ml + 1×${remainder2}ml` : `${fiveMlCount}×5ml`,
                                price: Math.round(option2Price),
                                totalMl: remainingMl
                              });
                            }

                            if (remainingMl >= 2) {
                              // Option 3: All 2ml samples
                              const twoMlCount = Math.floor(remainingMl / 2);
                              const remainder3 = remainingMl % 2;
                              const option3Price = (twoMlCount * 2 * samplePricePerMl * 1.4) + (remainder3 * samplePricePerMl * 1.5);
                              packagingOptions.push({
                                id: 3,
                                description: remainder3 > 0 ? `${twoMlCount}×2ml + 1×${remainder3}ml` : `${twoMlCount}×2ml`,
                                price: Math.round(option3Price),
                                totalMl: remainingMl
                              });
                            }

                            return (
                              <div key={sku.id} className="bg-muted rounded-lg p-4">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <Wine className="h-5 w-5 text-blue-600" />
                                      <h4 className="font-medium text-lg">{sku.products?.name}</h4>
                                      <Badge variant="outline">{sku.size_ml}ml</Badge>
                                      <Badge variant="outline">{formatPrice(sku.price)} Lei</Badge>
                                    </div>

                                    {/* Simple Inventory Status */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                      <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{newBottles}</div>
                                        <div className="text-sm text-muted-foreground">New Bottles</div>
                                      </div>

                                      <div className="text-center p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                                        <div className="text-2xl font-bold text-amber-600">{openedBottles}</div>
                                        <div className="text-sm text-muted-foreground">Opened Bottles</div>
                                      </div>

                                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{remainingMl}ml</div>
                                        <div className="text-sm text-muted-foreground">Remaining in Opened</div>
                                      </div>
                                    </div>

                                    {/* Sample Packaging Options */}
                                    {remainingMl > 0 && packagingOptions.length > 0 && (
                                      <div className="border-t pt-4">
                                        <h5 className="font-medium mb-3 flex items-center gap-2">
                                          <TestTube className="h-4 w-4" />
                                          Sample Packaging Options from {remainingMl}ml
                                        </h5>
                                        <div className="space-y-3">
                                          {packagingOptions.map((option, index) => (
                                            <div key={option.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                              <div className="flex items-center gap-3">
                                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                                  {index + 1})
                                                </span>
                                                <span className="font-medium">{option.description}</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-bold text-green-600">
                                                  {option.price} Lei
                                                </Badge>
                                                <Button size="sm" variant="outline" className="text-xs">
                                                  Create Samples
                                                </Button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>

                                        {/* Best Option Highlight */}
                                        {packagingOptions.length > 1 && (
                                          <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                            <div className="flex items-center gap-2">
                                              <span className="text-green-600 font-medium">💡 Best Revenue:</span>
                                              <span className="text-green-700 dark:text-green-300">
                                                Option {packagingOptions.indexOf(Math.max(...packagingOptions.map(o => o.price)) === packagingOptions.find(o => o.price === Math.max(...packagingOptions.map(p => p.price)))?.price ? packagingOptions.find(o => o.price === Math.max(...packagingOptions.map(p => p.price))) : packagingOptions[0]) + 1}
                                                - {Math.max(...packagingOptions.map(o => o.price))} Lei
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col gap-2 ml-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedSKU(sku);
                                        setShowSKUForm(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        // TODO: Open inventory management modal
                                      }}
                                    >
                                      <Package className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteSKU(sku.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex gap-2 pt-3 border-t">
                                  <Button size="sm" variant="outline" className="text-xs">
                                    📦 Open New Bottle
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs">
                                    ✏️ Update Remaining ml
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs">
                                    🧪 Create Selected Samples
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wine className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {bottleSearchQuery ? 'No bottle SKUs match your search.' : 'No bottle SKUs found. Create bottle sizes for your products!'}
                    </p>
                    {bottleSearchQuery ? (
                      <Button
                        onClick={() => setBottleSearchQuery('')}
                        className="mt-4"
                        variant="outline"
                      >
                        Clear Search
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedSKU(null);
                          setShowSKUForm(true);
                        }}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Bottle SKU
                      </Button>
                    )}
                  </div>
                )}
                
                {renderPagination(
                  bottlesPage,
                  bottlesTotalPages,
                  handleBottlesPageChange,
                  paginatedBottleBrands.length,
                  sortedBottleBrands.length
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="samples" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5" />
                      Sample SKUs (Mostras)
                    </CardTitle>
                    <CardDescription>
                      {sampleSKUs.length} sample SKUs (under 10ml) for discovery sets and testing
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedSKU(null);
                      setShowSKUForm(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Sample SKU
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search samples by product, brand, or label..."
                      value={sampleSearchQuery}
                      onChange={(e) => setSampleSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {sampleSearchQuery && (
                      <button
                        onClick={() => setSampleSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                {paginatedSamples.length > 0 ? (
                  <div className="space-y-3">
                    {paginatedSamples.map((sku) => (
                      <div key={sku.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <TestTube className="h-4 w-4 text-amber-600" />
                              <h4 className="font-medium">{sku.label}</h4>
                              <Badge variant="outline">{sku.size_ml}ml</Badge>
                              <Badge variant={sku.stock > 0 ? "default" : "destructive"}>
                                {sku.stock > 0 ? `${sku.stock} available` : "Out of stock"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {sku.products?.name} - {sku.products?.brand}
                            </p>
                            <div className="flex items-center gap-4 text-sm mt-2">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatPrice(sku.price)} Lei
                              </span>
                              <span>{(sku.price / 100 / sku.size_ml).toFixed(2)} Lei/ml</span>
                              {sku.size_ml === 1 && (
                                <Badge variant="outline" className="text-amber-600">
                                  Discovery Ready
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSKU(sku);
                                setShowSKUForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSKU(sku.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {sampleSearchQuery ? 'No sample SKUs match your search.' : 'No sample SKUs found. Create samples for discovery sets!'}
                    </p>
                    {sampleSearchQuery ? (
                      <Button
                        onClick={() => setSampleSearchQuery('')}
                        className="mt-4"
                        variant="outline"
                      >
                        Clear Search
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedSKU(null);
                          setShowSKUForm(true);
                        }}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Sample SKU
                      </Button>
                    )}
                  </div>
                )}
                
                {renderPagination(
                  samplesPage,
                  samplesTotalPages,
                  handleSamplesPageChange,
                  paginatedSamples.length,
                  filteredSampleSKUs.length
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discovery" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Discovery Set Configurations
                    </CardTitle>
                    <CardDescription>
                      Manage discovery set templates ({discoveryConfigs.length} total)
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedConfig(null);
                      setShowDiscoveryForm(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Configuration
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search discovery sets by name or description..."
                      value={discoverySearchQuery}
                      onChange={(e) => setDiscoverySearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {discoverySearchQuery && (
                      <button
                        onClick={() => setDiscoverySearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                {paginatedDiscoveryConfigs.length > 0 ? (
                  <div className="space-y-3">
                    {paginatedDiscoveryConfigs.map((config) => (
                      <div key={config.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-lg">{config.name}</h4>
                              <Badge variant={config.is_active ? "default" : "secondary"}>
                                {config.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant={config.is_customizable ? "outline" : "default"}>
                                {config.is_customizable ? "Customizable" : "Predefined"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {config.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatPrice(config.base_price)} Lei
                              </span>
                              <span>
                                Config: {config.total_slots}×{config.volume_ml}ml
                              </span>
                              <span>
                                Total: {config.total_slots * config.volume_ml}ml
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedConfig(config);
                                setShowDiscoveryForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteConfig(config.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {discoverySearchQuery ? 'No discovery sets match your search.' : 'No discovery set configurations found.'}
                    </p>
                    {discoverySearchQuery ? (
                      <Button
                        onClick={() => setDiscoverySearchQuery('')}
                        className="mt-4"
                        variant="outline"
                      >
                        Clear Search
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedConfig(null);
                          setShowDiscoveryForm(true);
                        }}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Configuration
                      </Button>
                    )}
                  </div>
                )}
                
                {renderPagination(
                  discoveryPage,
                  discoveryTotalPages,
                  handleDiscoveryPageChange,
                  paginatedDiscoveryConfigs.length,
                  filteredDiscoveryConfigs.length
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brands" className="space-y-6">
            <BrandImageManager />
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            {/* Database Exploration */}
            {dbExploration && (
              <Card>
                <CardHeader>
                  <CardTitle>Database Schema</CardTitle>
                  <CardDescription>Detailed view of your database structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">Available Tables:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {dbExploration.tables?.map((table: string) => (
                        <div key={table} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="font-mono text-sm">{table}</span>
                          <Badge variant="outline">
                            {dbExploration.counts?.[table]} rows
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Forms as Dialogs */}
        <Dialog 
          open={showProductForm} 
          onOpenChange={(open) => {
            setShowProductForm(open);
            if (!open) setSelectedProduct(null);
          }}
        >
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <ProductForm
              product={selectedProduct}
              onSuccess={handleProductFormSuccess}
              onCancel={() => {
                setShowProductForm(false);
                setSelectedProduct(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog 
          open={showSKUForm} 
          onOpenChange={(open) => {
            setShowSKUForm(open);
            if (!open) setSelectedSKU(null);
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <SKUForm
              sku={selectedSKU}
              productId={selectedSKU?.product_id}
              onSuccess={handleSKUFormSuccess}
              onCancel={() => {
                setShowSKUForm(false);
                setSelectedSKU(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog 
          open={showDiscoveryForm} 
          onOpenChange={(open) => {
            setShowDiscoveryForm(open);
            if (!open) setSelectedConfig(null);
          }}
        >
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DiscoverySetForm
              config={selectedConfig}
              onSuccess={handleDiscoveryFormSuccess}
              onCancel={() => {
                setShowDiscoveryForm(false);
                setSelectedConfig(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin; 