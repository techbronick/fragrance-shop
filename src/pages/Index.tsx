import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import BrandsCarousel from "@/components/BrandsCarousel";
import SalesCarousel from "@/components/SalesCarousel";
import NewArrivalsCarousel from "@/components/NewArrivalsCarousel";
import ClientReviews from "@/components/ClientReviews";
import { useProducts } from "@/hooks/useProducts";
import { useDiscoverySetConfigs, useDiscoverySetConfigsWithItems } from "@/hooks/useDiscoverySets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Gift, Award, Star, Users, Trophy, Package, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { formatPrice } from "@/utils/formatPrice";

const Index = () => {
  const navigate = useNavigate();
  const { data: products, isLoading, error } = useProducts();
  const { data: allConfigs, isLoading: isLoadingAllConfigs } = useDiscoverySetConfigs();
  const { data: configsWithItems, isLoading: isLoadingConfigsWithItems } = useDiscoverySetConfigsWithItems();
  const isLoadingDiscoverySets = isLoadingAllConfigs || isLoadingConfigsWithItems;
  
  // Select featured products from different brands for diversity
  const featuredProducts = (() => {
    if (!products || products.length === 0) return [];
    
    // Group products by brand
    const productsByBrand = products.reduce((acc, product) => {
      const brand = product.brand;
      if (!acc[brand]) {
        acc[brand] = [];
      }
      acc[brand].push(product);
      return acc;
    }, {} as Record<string, typeof products>);
    
    // Get unique brands
    const brands = Object.keys(productsByBrand);
    const featured = [];
    
    // Try to get one product from each of the first 3 different brands
    for (let i = 0; i < Math.min(3, brands.length); i++) {
      const brand = brands[i];
      if (productsByBrand[brand].length > 0) {
        featured.push(productsByBrand[brand][0]);
      }
    }
    
    // If we don't have 3 products yet, fill with remaining products
    while (featured.length < 3 && featured.length < products.length) {
      const remaining = products.filter(p => !featured.some(f => f.id === p.id));
      if (remaining.length > 0) {
        featured.push(remaining[0]);
      } else {
        break;
      }
    }
    
    return featured;
  })();

  if (error) {
    console.error('Error loading products:', error);
  }

  const handleTestPerfume = () => {
    navigate('/discovery-sets');
  };

  const handleExploreCollection = () => {
    navigate('/shop');
  };

  const handleViewAllPerfumes = () => {
    navigate('/shop');
  };

  const handleStartBuilding = () => {
    navigate('/discovery-sets');
  };

  // Filter discovery sets by IDs: Pentru El, Pentru Ea, Esential, Explorer
  const featuredDiscoverySets = (() => {
    if (!allConfigs) return [];
    
    // Create a map of configs with items for quick lookup
    const configsWithItemsMap = new Map();
    if (configsWithItems) {
      configsWithItems.forEach((config: any) => {
        configsWithItemsMap.set(config.id, config);
      });
    }
    
    // Target IDs for featured discovery sets
    const targetIds = [
      '3f7ccaf3-c200-4256-95c5-6db0e5fb782e',
      'c6258e67-e266-4dd3-9a4f-dd6a5e8b183d',
      'd0e8dabf-63bc-48f0-b8c8-5bf9da90e65c',
      '5fa4207d-3ba8-49ea-8ae9-cc9cd506584d'
    ];
    
    // Debug: Log all discovery sets to see what we have
    console.log('All discovery sets from DB:', allConfigs.map((c: any) => ({
      id: c.id,
      name: c.name,
      is_active: c.is_active,
      is_customizable: c.is_customizable
    })));
    
    const filtered = allConfigs
      .filter((config: any) => targetIds.includes(config.id))
      .map((config: any) => {
        // Get items from configsWithItemsMap if available, otherwise use empty array
        const configWithItems = configsWithItemsMap.get(config.id);
        const items = configWithItems?.items || [];
        
        return {
          id: config.id,
          name: config.name,
          description: config.description || '',
          price: config.base_price,
          samples: config.total_slots,
          volume: config.volume_ml,
          configuration: `${config.total_slots}×${config.volume_ml}ml`,
          image: config.image_url || '/Discoverybox.png',
          isCustomizable: config.is_customizable,
          fragrances: items.map((item: any) => {
            const sku = item.sku || item.skus;
            const product = sku?.product || sku?.products;
            return product?.name || 'Unknown';
          }).filter(Boolean)
        };
      })
      .sort((a, b) => {
        // Sort by the order of IDs in targetIds array
        const indexA = targetIds.indexOf(a.id);
        const indexB = targetIds.indexOf(b.id);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
    
    // Debug: Log filtered sets
    console.log('Filtered discovery sets:', filtered.map((s: any) => ({
      id: s.id,
      name: s.name,
      isCustomizable: s.isCustomizable,
      hasItems: s.fragrances.length > 0
    })));
    
    return filtered;
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Scent Discovery Vault | Parfumuri Niche, Branduri de Lux, Descoperă Arome Unice"
        description="Cea mai bună selecție de parfumuri de nișă și branduri de lux. Descoperă arome rare, exclusiviste și creează-ți propria colecție olfactivă. Shop online parfumuri niche autentice."
        url="https://scent-discovery-vault.com/"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Scent Discovery Vault",
            "url": "https://scent-discovery-vault.com/",
            "logo": "https://scent-discovery-vault.com/logo.png",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "MD",
              "addressLocality": "Chișinău"
            },
            "contactPoint": [{
              "@type": "ContactPoint",
              "contactType": "customer support",
              "email": "contact@scent-discovery-vault.com"
            }]
          })}
        </script>
      </Seo>
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        
        {/* Premium Brands Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-playfair font-medium mb-4">
                Branduri Premium Exclusiviste
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
                Colaborăm exclusiv cu cele mai respectate case de parfumuri din lume. 
                De la legendarul Tom Ford la inovatorul Le Labo, fiecare brand din colecția noastră 
                reprezintă excelența în parfumerie de nișă.
              </p>
              <p className="text-sm text-muted-foreground">
                Apasă pe un brand pentru a vedea produsele sale
              </p>
            </div>
            <BrandsCarousel />
          </div>
        </section>

        {/* Discovery Boxes Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Package className="h-6 w-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-playfair font-medium">
                  Discovery Boxes
                </h2>
                <Package className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Descoperă parfumuri noi cu seturile noastre curate sau creează-ți propriul set personalizat. 
                Perfect pentru explorarea de noi arome și găsirea următorului tău parfum semnătură.
              </p>
            </div>
            
            {isLoadingDiscoverySets ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="aspect-square rounded-lg bg-muted mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredDiscoverySets.map((set: any) => (
                  <Card 
                    key={set.id} 
                    className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    onClick={() => {
                      if (set.isCustomizable) {
                        navigate(`/discovery-sets?set=${set.id}&tab=builder`);
                      } else {
                        navigate(`/discovery-set/${set.id}`);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square rounded-lg overflow-hidden mb-4 relative">
                        <img 
                          src={set.image}
                          alt={`${set.name} Discovery Set`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/Discoverybox.png';
                          }}
                        />
                        <Badge 
                          className={`absolute top-2 right-2 ${
                            set.isCustomizable 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                              : set.name === 'Pentru Ea'
                              ? 'bg-pink-500 hover:bg-pink-600'
                              : set.name === 'Pentru El'
                              ? 'bg-blue-500 hover:bg-blue-600'
                              : 'bg-primary hover:bg-primary/90'
                          }`}
                        >
                          {set.isCustomizable ? 'Customizable' : 'Pre-filled'}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-playfair font-medium text-lg group-hover:text-primary transition-colors">{set.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {set.description || 'Descoperă parfumuri noi și unice'}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">{set.configuration} mostre</span>
                            <span className="font-semibold text-primary">{formatPrice(set.price)}</span>
                          </div>
                        </div>
                        {set.isCustomizable ? (
                          <Button 
                            variant="outline" 
                            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/discovery-sets?set=${set.id}&tab=builder`);
                            }}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Personalizează
                          </Button>
                        ) : (
                          <Button 
                            className="w-full" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/discovery-set/${set.id}`);
                            }}
                          >
                            <Gift className="h-4 w-4 mr-2" />
                            Adaugă în coș
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Button 
                size="lg" 
                variant="outline" 
                className="group"
                onClick={() => navigate('/discovery-sets')}
              >
                Vezi Toate Discovery Sets
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Collection */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-playfair font-medium mb-4">
                Colecția Principală
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Parfumuri selectate cu grijă ce captează esența luxului modern. 
                Fiecare aromă spune o poveste unică și definește personalitatea purtătorului.
              </p>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {[1, 2, 3].map((i) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} featured />
                ))}
              </div>
            )}
            
            <div className="text-center">
              <Button 
                size="lg" 
                variant="outline" 
                className="group"
                onClick={handleViewAllPerfumes}
              >
                Vezi Toate Parfumurile
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-playfair font-medium">
                  Noutăți
                </h2>
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Cele mai recente achiziții din lumea parfumurilor de lux
              </p>
            </div>
            <NewArrivalsCarousel />
          </div>
        </section>

        {/* Client Reviews */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-playfair font-medium">
                  Recenzii Clienți
                </h2>
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Descoperă experiențele extraordinare ale clienților noștri
              </p>
            </div>
            <ClientReviews />
          </div>
        </section>

        {/* Discovery Sets CTA */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-3xl font-playfair font-medium">
                    Creează-ți Setul Discovery
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Nu te poți decide? Creează-ți propriul set discovery cu orice cinci mostre de 1ml 
                    pentru un preț fix. Perfect pentru explorarea de noi familii de parfumuri și 
                    găsirea următorului tău parfum semnătură. Investiția ta în mostre se deduce din prețul sticlei complete.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-sm">Alege orice 5 mostre - 250 Lei</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Gift className="h-5 w-5 text-primary" />
                    <span className="text-sm">Transport gratuit pentru seturi</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-sm">Credit complet pentru sticle complete</span>
                  </div>
                </div>
                
                <Button size="lg" className="w-full sm:w-auto" onClick={handleStartBuilding}>
                  Începe Construirea Setului
                </Button>
              </div>
              
              <div className="aspect-square bg-gradient-to-br from-accent to-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="w-24 h-24 mx-auto mb-4 bg-background/50 rounded-full flex items-center justify-center">
                    <Gift className="h-12 w-12" />
                  </div>
                  <p className="text-sm font-medium">Setul Tău Discovery Personalizat</p>
                  <p className="text-xs mt-2">5 mostre × 1ml</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-12 border-t border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium">Selecție de Experți</h4>
                <p className="text-sm text-muted-foreground">Selectate manual de experți în parfumuri</p>
              </div>
              
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium">Transport Gratuit</h4>
                <p className="text-sm text-muted-foreground">La comenzi peste 1350 Lei</p>
              </div>
              
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium">De la Mostră la Sticlă</h4>
                <p className="text-sm text-muted-foreground">Credit complet pentru dimensiune completă</p>
              </div>
              
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium">100% Autenticitate</h4>
                <p className="text-sm text-muted-foreground">Parfumuri originale garantate</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
