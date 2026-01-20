import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DiscoverySetBuilder } from "@/components/discovery/DiscoverySetBuilder";
import { DiscoveryRecommendation } from "@/components/discovery/DiscoveryRecommendation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiscoverySetConfigs, useDiscoverySetConfigsWithItems } from "@/hooks/useDiscoverySets";
import { formatPrice } from "@/utils/formatPrice";
import { useCart } from "@/hooks/useCart";
import { useButtonAnimation } from "@/hooks/useButtonAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sparkles, Package, Heart, Gift, Palette, Briefcase, Sun, Moon, Users, Check, ArrowLeft, Home } from "lucide-react";

const DiscoverySets = () => {
  const { data: configs, isLoading } = useDiscoverySetConfigs();
  const { data: configsWithItems, isLoading: isLoadingWithItems } = useDiscoverySetConfigsWithItems();

  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [selectedPredefinedSet, setSelectedPredefinedSet] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { addItem } = useCart();
  const [animatingButtonId, setAnimatingButtonId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  // Ref for scroll target
  const tabsRef = useRef<HTMLDivElement>(null);

  // Map DB configs WITH items to display format for predefined sets
  const predefinedSets = configsWithItems
    ?.filter((c: any) => !c.is_customizable)
    .map((config: any) => ({
      id: config.id,
      name: config.name,
      description: config.description,
      price: config.base_price,
      samples: config.total_slots,
      configuration: `${config.total_slots}×${config.volume_ml}ml`,
      image: config.image_url || '/Discoverybox.png',
      isCustomizable: config.is_customizable,
      fragrances: config.items?.map((item: any) => 
        item.sku?.product?.name || 'Unknown'
      ) || [],
      _config: config
    })) || [];

  // Map customizable configs (no fixed items)
  const customizableConfigs = configs
    ?.filter((c: any) => c.is_customizable)
    .map((config: any) => ({
      id: config.id,
      name: config.name,
      description: config.description,
      price: config.base_price,
      samples: config.total_slots,
      configuration: `${config.total_slots}×${config.volume_ml}ml`,
      image: config.image_url || '/Discoverybox.png',
      isCustomizable: true,
      fragrances: [],
      _config: config
    })) || [];

  // Combine both for display
  const allSets = [...predefinedSets, ...customizableConfigs];

  const handleAddPredefinedSet = (set: any) => {
    const hasItems = set._config?.items && set._config.items.length > 0;
    
    if (hasItems) {
      addItem({
        id: set.id,
        type: 'predefined-bundle',
        configId: set.id,
        name: set.name,
        quantity: 1,
        price: Math.round(set.price / 100),
        sizeLabel: `${set.samples} mostre`,
        image: set.image
      });
      
      setAnimatingButtonId(set.id);
      setTimeout(() => setAnimatingButtonId(null), 500);
    } else {
      navigate(`/discovery-sets?set=${set.id}&tab=builder`);
    }
  };

  const handlePredefinedSetSelect = (set: any) => {
    setSelectedPredefinedSet(set);
    if (set) {
      navigate(`/discovery-sets?set=${set.id}&tab=builder`);
      
      // Scroll to tabs menu on mobile when selecting a set in builder tab
      if (isMobile && tabsRef.current) {
        // Use a longer timeout to ensure tab change and DOM update complete
        setTimeout(() => {
          const headerOffset = 80; // Header height + some padding
          const elementPosition = tabsRef.current?.getBoundingClientRect().top || 0;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 200);
      }
    }
  };

  useEffect(() => {
    const setId = searchParams.get('set');
    const configId = searchParams.get('config');
    const tabParam = searchParams.get('tab');
    
    if (setId) {
      const selectedSet = allSets.find(set => set.id === setId);
      if (selectedSet) {
        setSelectedPredefinedSet(selectedSet);
        setSelectedConfig(null);
        if (tabParam === 'builder') {
          setActiveTab("builder");
        }
      }
    } else if (configId) {
      setSelectedConfig(configId);
      setSelectedPredefinedSet(null);
      if (tabParam === 'builder') {
        setActiveTab("builder");
      }
    } else {
      setSelectedPredefinedSet(null);
      setSelectedConfig(null);
      if (!tabParam) {
        setActiveTab("overview");
      }
    }
  }, [searchParams, allSets.length]);

  if (isLoading || isLoadingWithItems) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Compact Breadcrumb Navigation */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between py-2 sm:py-2.5 px-3 sm:px-4 bg-muted/30 rounded-lg border">
            <nav className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 h-7 text-xs text-muted-foreground hover:text-primary"
              >
                <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Acasă</span>
              </Button>
              
              <span className="text-muted-foreground/60 text-xs">›</span>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/discovery-sets')}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 h-7 text-xs sm:text-sm text-foreground hover:text-primary font-medium"
              >
                <span className="truncate max-w-[120px] sm:max-w-none">Discovery Sets</span>
              </Button>
              
              {(selectedPredefinedSet || selectedConfig) && activeTab === "builder" && (
                <>
                  <span className="text-muted-foreground/60 text-xs">›</span>
                  <span className="text-xs sm:text-sm font-medium text-primary px-1 truncate max-w-[100px] sm:max-w-[200px]">
                    {selectedPredefinedSet ? selectedPredefinedSet.name : configs?.find(c => c.id === selectedConfig)?.name}
                  </span>
                </>
              )}
            </nav>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if ((selectedPredefinedSet || selectedConfig) && activeTab === "builder") {
                  setSelectedPredefinedSet(null);
                  setSelectedConfig(null);
                  setActiveTab("overview");
                  navigate('/discovery-sets');
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-1 px-2 py-1 h-7 text-xs ml-2 flex-shrink-0"
            >
              <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Înapoi</span>
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold mb-4 sm:mb-6 px-2">
            Discovery Sets
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed">
            Explorează lumea parfumurilor cu seturile noastre Discovery. Testează multiple parfumuri 
            înainte de a face alegerea perfectă pentru tine.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto mb-6 sm:mb-8 px-4">
            <div className="flex flex-col items-center text-center px-4 py-4">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-playfair font-semibold mb-2 sm:mb-3">Testează Înainte</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xs">
                Încearcă parfumurile acasă înainte de a cumpăra sticla completă
              </p>
            </div>
            <div className="flex flex-col items-center text-center px-4 py-4">
              <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-playfair font-semibold mb-2 sm:mb-3">Găsește-ți Favoritul</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xs">
                Descoperă parfumuri noi și identifică-ți preferințele
              </p>
            </div>
            <div className="flex flex-col items-center text-center px-4 py-4">
              <Gift className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-playfair font-semibold mb-2 sm:mb-3">Cadou Perfect</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xs">
                Un cadou ideal pentru iubitorii de parfumuri
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          if (value === "overview") {
            navigate('/discovery-sets', { replace: true });
          } else if (value === "builder") {
            if (selectedPredefinedSet) {
              navigate(`/discovery-sets?set=${selectedPredefinedSet.id}&tab=builder`, { replace: true });
            } else if (selectedConfig) {
              navigate(`/discovery-sets?config=${selectedConfig}&tab=builder`, { replace: true });
            } else {
              navigate('/discovery-sets?tab=builder', { replace: true });
            }
          } else if (value === "recommendation") {
            navigate('/discovery-sets?tab=recommendation', { replace: true });
          }
          
          // Scroll to tabs section after tab change
          setTimeout(() => {
            if (tabsRef.current) {
              const headerOffset = 80; // Header height + some padding
              const elementPosition = tabsRef.current.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }, 100);
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-3 font-medium">
              Toate Seturile
            </TabsTrigger>
            <TabsTrigger value="builder" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-3 font-medium">
              Constructor
            </TabsTrigger>
            <TabsTrigger value="recommendation" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-3 flex items-center justify-center gap-1 font-medium">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Nou
            </TabsTrigger>
          </TabsList>

          <div ref={tabsRef} className="scroll-mt-20">
          <TabsContent value="overview" className="mt-6 sm:mt-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* All Sets (predefined + customizable) */}
              {allSets.map((set) => {
                return (
                  <Card 
                    key={set.id} 
                    className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full"
                    onClick={() => {
                      if (set.isCustomizable) {
                        handlePredefinedSetSelect(set);
                        setSelectedConfig(null);
                        setActiveTab("builder");
                      } else {
                        navigate(`/discovery-set/${set.id}`);
                      }
                    }}
                  >
                    <CardContent className="p-3 sm:p-4 h-full flex flex-col">
                      <div className="aspect-square rounded-lg overflow-hidden mb-2 sm:mb-3 relative">
                        <img 
                          src={set.image} 
                          alt={set.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col flex-grow">
                        <div className="flex items-start justify-between mb-1.5 sm:mb-2 gap-1">
                          <h3 className="text-sm sm:text-base md:text-lg font-playfair font-medium group-hover:text-primary transition-colors leading-tight flex-1 min-w-0">
                            {set.name}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className="text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0"
                          >
                            {set.samples} mostre
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                          {set.description}
                        </p>
                        <div className="flex-grow">
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2">Configurație:</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                              {set.configuration}
                            </Badge>
                          </div>
                          <div className="min-h-[2.5rem] sm:min-h-[3rem] flex flex-col justify-start">
                            {!set.isCustomizable && set.fragrances && set.fragrances.length > 0 ? (
                              <>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Include:</p>
                                <p className="text-[10px] sm:text-xs text-primary font-medium line-clamp-2 leading-relaxed">
                                  {set.fragrances.slice(0, 3).join(", ")}
                                  {set.fragrances.length > 3 && "..."}
                                </p>
                              </>
                            ) : (
                              <p className="text-[10px] sm:text-xs text-muted-foreground italic leading-relaxed">
                                Alege-ți propriile parfumuri din colecția noastră
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2 border-t mt-auto">
                          <span className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                            {formatPrice(set.price)}
                          </span>
                          {set.isCustomizable ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-1.5 mt-2 sm:mt-0 w-full sm:w-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePredefinedSetSelect(set);
                                setSelectedConfig(null);
                                setActiveTab("builder");
                              }}
                            >
                              Personalizează
                            </Button>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-1 mt-2 sm:mt-0 w-full">
                              <Button 
                                size="sm" 
                                variant="outline"
                              className="text-[10px] sm:text-xs px-2 py-1.5 sm:py-1 w-full sm:w-auto sm:flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/discovery-set/${set.id}`);
                                }}
                              >
                                Vezi Setul
                              </Button>
                              <Button 
                                size="sm" 
                              className={`text-[10px] sm:text-xs px-2 py-1.5 sm:py-1 w-full sm:w-auto sm:flex-1 ${animatingButtonId === set.id ? "bg-green-500 text-white animate-pulse" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddPredefinedSet(set);
                                }}
                                disabled={animatingButtonId === set.id}
                              >
                                {animatingButtonId === set.id ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Adăugat!
                                  </>
                                ) : (
                                  "Adaugă"
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="builder" className="mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab("overview")}
                  className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground hover:text-primary"
                >
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="whitespace-nowrap">Vezi Toate Seturile</span>
                </Button>
              </div>
              {(selectedPredefinedSet || selectedConfig) && (
                <div className="text-xs sm:text-sm">
                  <span className="text-muted-foreground">Personalizezi: </span>
                  <span className="font-medium text-primary break-words">
                    {selectedPredefinedSet ? selectedPredefinedSet.name : configs?.find(c => c.id === selectedConfig)?.name}
                  </span>
                </div>
              )}
            </div>
            
            <DiscoverySetBuilder 
              configs={configs?.filter((c: any) => c.is_customizable) || []}
              selectedConfigId={selectedConfig}
              selectedPredefinedSet={selectedPredefinedSet}
              onConfigSelect={setSelectedConfig}
              onPredefinedSetSelect={handlePredefinedSetSelect}
            />
          </TabsContent>

          <TabsContent value="recommendation" className="mt-6 sm:mt-8">
            <DiscoveryRecommendation />
          </TabsContent>
          </div>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default DiscoverySets;