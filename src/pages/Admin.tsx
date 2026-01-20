import React, { useState, useEffect, useMemo } from 'react';
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
  getStats,
  getOrderStats,
  productUtils,
  skuUtils,
  discoverySetUtils
} from '@/utils/supabase-admin';
import { Activity, Package, Settings, Users, Zap, Plus, Edit, Trash2, Eye, DollarSign, Wine, TestTube, Search, X, LogOut, Image, Loader2 } from 'lucide-react';
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
  const { signOut, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Verify admin access on mount
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, navigate, toast]);
  const [products, setProducts] = useState<any[]>([]);
  const [skus, setSkus] = useState<any[]>([]);
  const [skusLoading, setSkusLoading] = useState(false);
  const [discoveryConfigs, setDiscoveryConfigs] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSKU, setSelectedSKU] = useState<any>(null);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showSKUForm, setShowSKUForm] = useState(false);
  const [showDiscoveryForm, setShowDiscoveryForm] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [discoverySearchQuery, setDiscoverySearchQuery] = useState('');
  
  // Pagination state
  const [productsPage, setProductsPage] = useState(1);
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
    // Scroll to tabs section after tab change
    setTimeout(() => {
      const tabsElement = document.querySelector('[role="tablist"]')?.parentElement;
      if (tabsElement) {
        const headerOffset = 80; // Header height + some padding
        const elementPosition = tabsElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  useEffect(() => {
    handleTestConnection();
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      handleLoadProducts(),
      handleLoadDiscoveryConfigs()
    ]);
    // SKUs will be loaded automatically via useEffect when products are loaded
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const [result, stats, orderStatsData] = await Promise.all([
        testConnections(),
        getStats(),
        getOrderStats()
      ]);
      setConnectionStatus(result);

      if (stats) {
        setDbStats(stats);
      }

      if (orderStatsData) {
        setOrderStats(orderStatsData);
      }
    } catch (error) {
      console.error('Test failed:', error);
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

  // Load SKUs for products on current page (optimized)
  const loadSKUsForCurrentPage = async (currentProducts: any[]) => {
    if (currentProducts.length === 0) {
      setSkus([]);
      return;
    }

    setSkusLoading(true);
    try {
      const productIds = currentProducts.map(p => p.id).filter(Boolean);
      if (productIds.length === 0) {
        setSkus([]);
        return;
      }

      console.log(`🔄 Loading SKUs for ${productIds.length} products on current page...`);
      const { data, error } = await skuUtils.getSKUsByProductIds(productIds);
      
      if (error) {
        console.error('❌ Error loading SKUs:', error);
        toast({
          title: "Error Loading SKUs",
          description: error.message || "Failed to load SKUs",
          variant: "destructive",
        });
      } else {
        console.log(`✅ Loaded ${data?.length || 0} SKUs for current page`);
        setSkus(data || []);
      }
    } catch (error) {
      console.error('❌ Failed to load SKUs:', error);
      toast({
        title: "Error",
        description: "Failed to load SKUs. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setSkusLoading(false);
    }
  };

  // Keep handleLoadSkus for compatibility (SKUs are now loaded via useEffect)
  const handleLoadSkus = async () => {
    // SKUs are automatically loaded via useEffect when productsOnCurrentPage changes
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

  const handleProductFormSuccess = async () => {
    setShowProductForm(false);
    setSelectedProduct(null);
    
    // Reload products immediately
    await handleLoadProducts();
    
    // SKUs will be reloaded automatically via useEffect when productsOnCurrentPage updates
    handleTestConnection(); // Refresh stats
  };

  const handleSKUFormSuccess = async () => {
    setShowSKUForm(false);
    setSelectedSKU(null);
    
    // Reload SKUs for current page after a small delay to ensure database commit
    setTimeout(async () => {
      if (activeTab === 'products') {
        // Calculate current page products
        const sortedBrands = Object.keys(productsByBrand).sort();
        const paginatedBrands = sortedBrands.slice(
          (productsPage - 1) * ITEMS_PER_PAGE,
          productsPage * ITEMS_PER_PAGE
        );
        const pageProducts: any[] = [];
        paginatedBrands.forEach(brand => {
          const brandProducts = productsByBrand[brand] || [];
          pageProducts.push(...brandProducts);
        });
        if (pageProducts.length > 0) {
          await loadSKUsForCurrentPage(pageProducts);
        }
      }
      handleTestConnection(); // Refresh stats
    }, 500);
  };

  const handleDiscoveryFormSuccess = () => {
    setShowDiscoveryForm(false);
    setSelectedConfig(null);
    handleLoadDiscoveryConfigs();
    handleTestConnection(); // Refresh stats
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
      // Reload SKUs for current page immediately
      if (activeTab === 'products') {
        // Calculate current page products
        const sortedBrands = Object.keys(productsByBrand).sort();
        const paginatedBrands = sortedBrands.slice(
          (productsPage - 1) * ITEMS_PER_PAGE,
          productsPage * ITEMS_PER_PAGE
        );
        const pageProducts: any[] = [];
        paginatedBrands.forEach(brand => {
          const brandProducts = productsByBrand[brand] || [];
          pageProducts.push(...brandProducts);
        });
        if (pageProducts.length > 0) {
          await loadSKUsForCurrentPage(pageProducts);
        }
      }
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

  // Sort brands alphabetically
  const sortedBrands = Object.keys(productsByBrand).sort();
  
  // Pagination for products (by brand)
  const productsTotalPages = Math.ceil(sortedBrands.length / ITEMS_PER_PAGE);
  const paginatedBrands = sortedBrands.slice(
    (productsPage - 1) * ITEMS_PER_PAGE,
    productsPage * ITEMS_PER_PAGE
  );

  // Calculate products on current page
  const productsOnCurrentPage = useMemo(() => {
    const pageProducts: any[] = [];
    paginatedBrands.forEach(brand => {
      const brandProducts = productsByBrand[brand] || [];
      pageProducts.push(...brandProducts);
    });
    return pageProducts;
  }, [paginatedBrands, productsByBrand]);

  // Group SKUs by product_id (memoized for performance)
  const skusByProduct = useMemo(() => {
    return skus.reduce((acc, sku) => {
      if (!sku || !sku.product_id) {
        return acc;
      }
      
      const productId = sku.product_id;
      if (!acc[productId]) {
        acc[productId] = [];
      }
      if (!acc[productId].some(existingSku => existingSku.id === sku.id)) {
        acc[productId].push(sku);
      }
      return acc;
    }, {} as Record<string, any[]>);
  }, [skus]);

  // Load SKUs when products on current page change
  useEffect(() => {
    if (activeTab === 'products' && productsOnCurrentPage.length > 0) {
      loadSKUsForCurrentPage(productsOnCurrentPage);
    }
  }, [paginatedBrands.join(','), productsPage, activeTab]);

  const filteredDiscoveryConfigs = discoveryConfigs.filter(config =>
    matchesSearch(config.name, discoverySearchQuery) ||
    matchesSearch(config.description || '', discoverySearchQuery)
  );
  
  // Pagination for discovery sets
  const discoveryTotalPages = Math.ceil(filteredDiscoveryConfigs.length / ITEMS_PER_PAGE);
  const paginatedDiscoveryConfigs = filteredDiscoveryConfigs.slice(
    (discoveryPage - 1) * ITEMS_PER_PAGE,
    discoveryPage * ITEMS_PER_PAGE
  );
  
  // Reset pagination when search changes
  useEffect(() => {
    setProductsPage(1);
  }, [productSearchQuery]);
  
  useEffect(() => {
    setDiscoveryPage(1);
  }, [discoverySearchQuery]);
  
  // Pagination handlers
  const handleProductsPageChange = (page: number) => {
    setProductsPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDiscoveryPageChange = (page: number) => {
    setDiscoveryPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper functions
  const formatPrice = (priceInBani: number) => {
    return (priceInBani / 100).toFixed(2);
  };

  const isBottle = (sizeMl: number) => sizeMl >= 10;
  const isSample = (sizeMl: number) => sizeMl < 10;
  
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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 scroll-mt-20">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="discovery">Discovery Sets</TabsTrigger>
            <TabsTrigger value="brands">Brands</TabsTrigger>
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
              <CardContent>
                {connectionStatus && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={connectionStatus.anonSuccess ? "default" : "destructive"}>
                          {connectionStatus.anonSuccess ? "✅ Connected" : "❌ Failed"}
                        </Badge>
                        <span className="font-medium">Website Status</span>
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
                        <span className="font-medium">Database Status</span>
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
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-rose-50 dark:bg-rose-950 rounded-lg">
                      <div className="text-2xl font-bold text-rose-600">{sortedBrands.length}</div>
                      <div className="text-sm text-muted-foreground">Brands</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{dbStats.products}</div>
                      <div className="text-sm text-muted-foreground">Products</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{dbStats.discoveryConfigs}</div>
                      <div className="text-sm text-muted-foreground">Discovery Sets</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Statistics */}
            {orderStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Order Statistics
                  </CardTitle>
                  <CardDescription>Sales and order metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Main Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">
                          {orderStats.totalOrders}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Orders</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(orderStats.completedRevenue)}
                        </div>
                        <div className="text-sm text-muted-foreground">Completed Revenue</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {orderStats.ordersToday}
                        </div>
                        <div className="text-sm text-muted-foreground">Orders Today</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPrice(orderStats.monthRevenue)}
                        </div>
                        <div className="text-sm text-muted-foreground">This Month</div>
                      </div>
                    </div>

                    {/* Orders by Status */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Orders by Status</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {orderStats.statusCounts.placed > 0 && (
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Placed</span>
                              <Badge variant="secondary">{orderStats.statusCounts.placed}</Badge>
                            </div>
                          </div>
                        )}
                        {orderStats.statusCounts.paid > 0 && (
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Paid</span>
                              <Badge variant="default">{orderStats.statusCounts.paid}</Badge>
                            </div>
                          </div>
                        )}
                        {orderStats.statusCounts.shipped > 0 && (
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Shipped</span>
                              <Badge variant="default">{orderStats.statusCounts.shipped}</Badge>
                            </div>
                          </div>
                        )}
                        {orderStats.statusCounts.delivered > 0 && (
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Delivered</span>
                              <Badge variant="default">{orderStats.statusCounts.delivered}</Badge>
                            </div>
                          </div>
                        )}
                        {orderStats.statusCounts.draft > 0 && (
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Draft</span>
                              <Badge variant="outline">{orderStats.statusCounts.draft}</Badge>
                            </div>
                          </div>
                        )}
                        {orderStats.statusCounts.canceled > 0 && (
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Canceled</span>
                              <Badge variant="destructive">{orderStats.statusCounts.canceled}</Badge>
                            </div>
                          </div>
                        )}
                        {orderStats.statusCounts.refunded > 0 && (
                          <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Refunded</span>
                              <Badge variant="destructive">{orderStats.statusCounts.refunded}</Badge>
                            </div>
                          </div>
                        )}
                      </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => {
                      setSelectedProduct(null);
                      setShowProductForm(true);
                    }}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Package className="h-6 w-6" />
                    <span>Add New Product</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedSKU(null);
                      setShowSKUForm(true);
                    }}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Package className="h-6 w-6" />
                    <span>Add SKU</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedConfig(null);
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
                            {productsByBrand[brand].map((product) => {
                              const productSKUs = skusByProduct[product.id] || [];
                              const bottleSKUs = productSKUs.filter(sku => isBottle(sku.size_ml));
                              const sampleSKUs = productSKUs.filter(sku => isSample(sku.size_ml));
                              
                              return (
                                <div key={`${brand}-${product.id}`} className="p-4 bg-muted rounded-lg">
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
                                  
                                  {/* SKUs Accordion for this product */}
                                  {skusLoading && productSKUs.length === 0 ? (
                                    <div className="mt-4 flex items-center justify-center py-4">
                                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                                      <span className="text-sm text-muted-foreground">Loading SKUs...</span>
                                    </div>
                                  ) : productSKUs.length > 0 ? (
                                    <Accordion type="single" collapsible className="mt-4">
                                      <AccordionItem key={`skus-accordion-${brand}-${product.id}`} value={`skus-${brand}-${product.id}`} className="border-0">
                                        <AccordionTrigger className="py-2 hover:no-underline">
                                          <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                              SKUs ({productSKUs.length})
                                            </span>
                                            {bottleSKUs.length > 0 && (
                                              <Badge variant="outline" className="text-xs">
                                                <Wine className="h-3 w-3 mr-1" />
                                                {bottleSKUs.length} bottles
                                              </Badge>
                                            )}
                                            {sampleSKUs.length > 0 && (
                                              <Badge variant="outline" className="text-xs">
                                                <TestTube className="h-3 w-3 mr-1" />
                                                {sampleSKUs.length} samples
                                              </Badge>
                                            )}
                                            {skusLoading && (
                                              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                            )}
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-2">
                                          {skusLoading ? (
                                            <div className="flex items-center justify-center py-4">
                                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                                              <span className="text-sm text-muted-foreground">Refreshing SKUs...</span>
                                            </div>
                                          ) : (
                                            <div className="space-y-2 pl-4 border-l-2 border-muted-foreground/20">
                                              {productSKUs.map((sku, skuIndex) => (
                                                <div key={`${brand}-${product.id}-${sku.id}-${skuIndex}`} className="p-3 bg-background rounded-lg border">
                                                  <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        {isBottle(sku.size_ml) ? (
                                                          <Wine className="h-4 w-4 text-blue-600" />
                                                        ) : (
                                                          <TestTube className="h-4 w-4 text-amber-600" />
                                                        )}
                                                        <span className="font-medium">{sku.label}</span>
                                                        <Badge variant="outline">{sku.size_ml}ml</Badge>
                                                        <Badge variant={sku.stock > 0 ? "default" : "destructive"}>
                                                          {sku.stock > 0 ? `${sku.stock} in stock` : "Out of stock"}
                                                        </Badge>
                                                        {isBottle(sku.size_ml) ? (
                                                          <Badge variant="secondary">Bottle</Badge>
                                                        ) : (
                                                          <Badge variant="secondary">Sample</Badge>
                                                        )}
                                                      </div>
                                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                          <DollarSign className="h-3 w-3" />
                                                          {formatPrice(sku.price)} Lei
                                                        </span>
                                                        <span>{(sku.price / 100 / sku.size_ml).toFixed(2)} Lei/ml</span>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
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
                                          )}
                                        </AccordionContent>
                                      </AccordionItem>
                                    </Accordion>
                                  ) : null}
                                </div>
                              );
                            })}
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