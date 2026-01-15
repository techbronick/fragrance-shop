import { useState, useEffect } from "react";
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
      
      <div className="container mx-auto px-4 py-8">
        {/* Compact Breadcrumb Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between py-2 px-4 bg-muted/30 rounded-lg border">
            <nav className="flex items-center space-x-2 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center gap-1 px-2 py-1 h-7 text-xs text-muted-foreground hover:text-primary"
              >
                <Home className="h-3 w-3" />
                <span className="hidden sm:inline">Acasă</span>
              </Button>
              
              <span className="text-muted-foreground/60 text-xs">›</span>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/discovery-sets')}
                className="flex items-center gap-1 px-2 py-1 h-7 text-xs text-foreground hover:text-primary font-medium"
              >
                <span className="truncate">Discovery Sets</span>
              </Button>
              
              {(selectedPredefinedSet || selectedConfig) && activeTab === "builder" && (
                <>
                  <span className="text-muted-foreground/60 text-xs">›</span>
                  <span className="text-xs font-medium text-primary px-1 truncate">
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
              <ArrowLeft className="h-3 w-3" />
              <span className="hidden sm:inline">Înapoi</span>
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4">
            Discovery Sets
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Explorează lumea parfumurilor cu seturile noastre Discovery. Testează multiple parfumuri 
            înainte de a face alegerea perfectă pentru tine.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="flex flex-col items-center text-center">
              <Package className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Testează Înainte</h3>
              <p className="text-sm text-muted-foreground">
                Încearcă parfumurile acasă înainte de a cumpăra sticla completă
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Heart className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Găsește-ți Favoritul</h3>
              <p className="text-sm text-muted-foreground">
                Descoperă parfumuri noi și identifică-ți preferințele
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Gift className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Cadou Perfect</h3>
              <p className="text-sm text-muted-foreground">
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
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2">
              Toate Seturile
            </TabsTrigger>
            <TabsTrigger value="builder" className="text-xs sm:text-sm px-2 py-2">
              Constructor
            </TabsTrigger>
            <TabsTrigger value="recommendation" className="text-xs sm:text-sm px-2 py-2 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              Nou
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
                    <CardContent className="p-4 h-full flex flex-col">
                      <div className="aspect-square rounded-lg overflow-hidden mb-3 relative">
                        <img 
                          src={set.image} 
                          alt={set.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-playfair font-medium group-hover:text-primary transition-colors">{set.name}</h3>
                          <Badge variant="secondary" className="text-xs">{set.samples} mostre</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {set.description}
                        </p>
                        <div className="flex-grow">
                          <p className="text-xs text-muted-foreground mb-2">Configurație:</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              {set.configuration}
                            </Badge>
                          </div>
                          <div className="min-h-[3rem] flex flex-col justify-start">
                            {!set.isCustomizable && set.fragrances && set.fragrances.length > 0 ? (
                              <>
                                <p className="text-xs text-muted-foreground mb-1">Include:</p>
                                <p className="text-xs text-primary font-medium line-clamp-2">
                                  {set.fragrances.slice(0, 3).join(", ")}
                                  {set.fragrances.length > 3 && "..."}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">
                                Alege-ți propriile parfumuri din colecția noastră
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-between pt-2 border-t mt-auto">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(set.price)}
                          </span>
                          {set.isCustomizable ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-xs px-3 py-1 mt-2 xs:mt-0"
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
                            <div className="flex gap-1 mt-2 xs:mt-0">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs px-2 py-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/discovery-set/${set.id}`);
                                }}
                              >
                                Vezi Setul
                              </Button>
                              <Button 
                                size="sm" 
                                className={`text-xs px-2 py-1 ${animatingButtonId === set.id ? "bg-green-500 text-white animate-pulse" : ""}`}
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

          <TabsContent value="builder" className="mt-8">
            <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab("overview")}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
                >
                  <Package className="h-4 w-4" />
                  <span>Vezi Toate Seturile</span>
                </Button>
              </div>
              {(selectedPredefinedSet || selectedConfig) && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Personalizezi: </span>
                  <span className="font-medium text-primary">
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

          <TabsContent value="recommendation" className="mt-8">
            <DiscoveryRecommendation />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default DiscoverySets;