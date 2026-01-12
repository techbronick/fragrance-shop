import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useButtonAnimation } from "@/hooks/useButtonAnimation";
import { formatPrice } from "@/utils/formatPrice";
import { 
  ArrowLeft, 
  Package, 
  Heart, 
  Briefcase, 
  Sun, 
  Moon, 
  Palette,
  ShoppingCart,
  Star,
  Info,
  Droplets,
  Clock,
  Sparkles,
  Check,
  Home
} from "lucide-react";
import { useDiscoverySetConfigsWithItems } from "@/hooks/useDiscoverySets";

// Icon mapping for display purposes
const iconMap: Record<string, React.ComponentType<any>> = {
  'heart': Heart,
  'briefcase': Briefcase,
  'sun': Sun,
  'moon': Moon,
  'palette': Palette,
  'package': Package
};

const DiscoverySetProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAnimating, triggerAnimation } = useButtonAnimation();
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Hook called INSIDE the component
  const { data: configs, isLoading } = useDiscoverySetConfigsWithItems();

  // Map DB configs to display format
  const predefinedSets = configs
    ?.filter((c: any) => c.items && c.items.length > 0 && c.is_active)
    .map((config: any) => ({
      id: config.id,
      name: config.name,
      description: config.description,
      price: config.base_price,
      samples: config.total_slots,
      configuration: `${config.total_slots}×${config.volume_ml}ml`,
      image: config.image_url || '/Discoverybox.png',
      isCustomizable: config.is_customizable,
      fragrances: config.items?.map((item: any) => ({
        name: item.sku?.product?.name || 'Unknown',
        brand: item.sku?.product?.brand || 'Unknown',
        notes: [
          ...(item.sku?.product?.notes_top || []),
          ...(item.sku?.product?.notes_mid || []),
          ...(item.sku?.product?.notes_base || [])
        ].slice(0, 3).join(', '),
        description: item.sku?.product?.description || ''
      })) || [],
      _config: config
    })) || [];

  const discoverySet = predefinedSets.find((set: any) => set.id === id);

  // Loading state
  if (isLoading) {
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

  if (!discoverySet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Discovery Set nu a fost găsit</h1>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi la Pagina Principală
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Default icon for sets
  const IconComponent = Package;
  const priceInLei = Math.round(discoverySet.price / 100);

  const handleAddToCart = () => {
    // Add predefined bundle to cart (CLIENT-SIDE ONLY - no DB write during browsing)
    addItem({
      id: discoverySet.id,
      type: 'predefined-bundle',
      configId: discoverySet.id,
      name: discoverySet.name,
      quantity: quantity,
      price: priceInLei,
      sizeLabel: `${discoverySet.samples} mostre`,
      image: discoverySet.image
    });
    
    triggerAnimation();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Compact Breadcrumb Navigation */}
        <div className="mb-6">
          <div className="py-2 px-4 bg-muted/30 rounded-lg border">
            <nav className="flex items-center space-x-2 min-w-0">
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
                className="flex items-center gap-1 px-2 py-1 h-7 text-xs text-muted-foreground hover:text-primary"
              >
                <span className="truncate">Discovery Sets</span>
              </Button>
              
              <span className="text-muted-foreground/60 text-xs">›</span>
              
              <span className="text-xs font-medium text-primary px-1 truncate">
                {discoverySet.name}
              </span>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-accent/20">
              <img
                src={imageError ? "/Discoverybox.png" : discoverySet.image}
                alt={discoverySet.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <IconComponent className="h-6 w-6 text-primary" />
                <Badge variant="secondary" className="text-sm">
                  {discoverySet.configuration}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-3">
                {discoverySet.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {discoverySet.description}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(priceInLei)}
                </span>
                <Badge variant="outline" className="text-sm">
                  {discoverySet.samples} mostre incluse
                </Badge>
              </div>
            </div>

            {/* Quantity and Add to Cart or Customize */}
            <div className="space-y-4">
              {!discoverySet.isCustomizable && (
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Cantitate:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}
              
              {!discoverySet.isCustomizable ? (
                <Button 
                  onClick={handleAddToCart}
                  className={`w-full flex items-center gap-2 ${isAnimating ? "bg-green-500 text-white animate-pulse" : ""}`}
                  size="lg"
                  disabled={isAnimating}
                >
                  {isAnimating ? (
                    <>
                      <Check className="h-4 w-4" />
                      Adăugat în coș!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Adaugă în coș - {formatPrice(priceInLei * quantity)}
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/discovery-sets?tab=builder')}
                  className="w-full flex items-center gap-2"
                  size="lg"
                >
                  <Palette className="h-4 w-4" />
                  Personalizează Setul
                </Button>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm">Livrare gratuită</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm">Livrare în 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm">Parfumuri originale</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fragrances Section */}
        {discoverySet.fragrances && discoverySet.fragrances.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-playfair font-bold mb-3">
                Parfumurile incluse
              </h2>
              <p className="text-muted-foreground">
                Descoperă fiecare parfum din acest set special
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discoverySet.fragrances.map((fragrance: any, index: number) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-playfair">
                          {fragrance.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {fragrance.brand}
                        </p>
                      </div>
                      <Droplets className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {fragrance.notes && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Note principale:</p>
                        <p className="text-sm text-muted-foreground">{fragrance.notes}</p>
                      </div>
                    )}
                    {fragrance.description && (
                      <p className="text-sm text-muted-foreground">
                        {fragrance.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Discovery Set Info */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Despre acest Discovery Set
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Ce primești:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {discoverySet.samples} mostre de parfum ({discoverySet.configuration})</li>
                  <li>• Cutie elegantă de prezentare</li>
                  <li>• Instrucțiuni de utilizare</li>
                  <li>• Garanție de originalitate</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Avantaje:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Testezi parfumurile acasă în confort</li>
                  <li>• Economisești bani înainte de cumpărare</li>
                  <li>• Descoperi parfumuri noi</li>
                  <li>• Cadou perfect pentru oricine</li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-2">Cum să folosești mostrele:</h4>
              <p className="text-sm text-muted-foreground">
                Aplică parfumul pe punctele de puls (încheieturi, gât, după urechi) și lasă-l să se dezvolte 
                pe pielea ta timp de câteva ore. Fiecare parfum evoluează diferit pe fiecare persoană, 
                așa că testează-le în diferite momente ale zilei pentru a-ți forma o opinie completă.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Discovery Sets */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-playfair font-bold mb-3">
            Alte Discovery Sets
          </h2>
          <p className="text-muted-foreground">
            Explorează și alte colecții de parfumuri
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {predefinedSets
            .filter((set: any) => set.id !== discoverySet.id)
            .slice(0, 4)
            .map((set: any) => {
              return (
                <Card 
                  key={set.id} 
                  className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => navigate(`/discovery-set/${set.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-lg overflow-hidden mb-3">
                      <img 
                        src={set.image} 
                        alt={set.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-playfair font-medium group-hover:text-primary transition-colors">
                          {set.name}
                        </h3>
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {set.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {set.configuration}
                        </Badge>
                        <span className="text-sm font-semibold text-primary">
                          {formatPrice(set.price)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DiscoverySetProduct;