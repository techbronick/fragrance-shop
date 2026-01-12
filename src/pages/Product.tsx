import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useProduct } from "@/hooks/useProducts";
import { useSKUs } from "@/hooks/useSKUs";
import { formatPrice } from "@/utils/formatPrice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Heart, Share2, Minus, Plus, Calendar, Users, Palette, Sparkles, ExternalLink, BookOpen, Timer, Target, ArrowLeft, Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Seo from "@/components/Seo";
import { useCart } from "@/hooks/useCart";
import { useButtonAnimation } from "@/hooks/useButtonAnimation";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: product, isLoading: productLoading } = useProduct(id || "");
  const { data: skus, isLoading: skusLoading } = useSKUs(id || "");
  const [selectedSKU, setSelectedSKU] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCart();
  const { isAnimating, triggerAnimation } = useButtonAnimation();

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col">
        <Seo
          title="ID Produs Lipsă | Parfum Niche | Scent Discovery Vault"
          description="Nu s-a specificat un ID de produs valid."
          image=""
          url=""
          type="website"
        />
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-playfair font-medium mb-4">ID Produs Lipsă</h1>
            <p className="text-muted-foreground mb-8">Nu s-a specificat un ID de produs valid.</p>
            <Button onClick={() => window.history.back()}>Înapoi</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (productLoading || skusLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Seo
          title="Încărcare Produs | Parfum Niche | Scent Discovery Vault"
          description="Încărcarea produsului în curs de desfășurare."
          image=""
          url=""
          type="website"
        />
        <Header />
        <main className="flex-1 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="aspect-square bg-muted rounded-lg animate-pulse mb-6"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded w-24 animate-pulse"></div>
                  <div className="h-12 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-20 bg-muted rounded animate-pulse"></div>
                <div className="h-32 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Seo
          title="Produs indisponibil"
          description="Produsul nu este disponibil momentan."
          image=""
          url=""
          type="website"
        />
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-playfair font-medium mb-4">Produs indisponibil</h1>
            <p className="text-muted-foreground mb-8">Produsul nu este disponibil momentan.</p>
            <Button onClick={() => window.history.back()}>Înapoi</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentSKU = skus?.find(sku => sku.id === selectedSKU) || skus?.find(sku => sku.size_ml === 100) || skus?.[0];
  
  const handleImageError = () => {
    setImageError(true);
  };

  const fallbackImage = "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=600&h=600&q=75&fm=webp";

  const FragranceNotesPyramid = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>Piramida Notelor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
  <div className="space-y-4">
    {/* Note de Vârf - ascunde dacă array-ul e gol */}
    {product.notes_top && product.notes_top.length > 0 && (
      <div className="relative">
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg border-l-4 border-yellow-400">
          <h4 className="font-medium mb-2 text-yellow-800">Note de Vârf</h4>
          <p className="text-sm text-yellow-700">{product.notes_top.join(", ")}</p>
        </div>
      </div>
    )}
    
    {/* Note de Inimă - ascunde dacă array-ul e gol */}
    {product.notes_mid && product.notes_mid.length > 0 && (
      <div className="relative">
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-lg border-l-4 border-pink-400">
          <h4 className="font-medium mb-2 text-pink-800">Note de Inimă</h4>
          <p className="text-sm text-pink-700">{product.notes_mid.join(", ")}</p>
        </div>
      </div>
    )}
    
    {/* Note de Bază - ascunde dacă array-ul e gol */}
    {product.notes_base && product.notes_base.length > 0 && (
      <div className="relative">
        <div className="bg-gradient-to-r from-amber-100 to-brown-100 p-4 rounded-lg border-l-4 border-amber-600">
          <h4 className="font-medium mb-2 text-amber-800">Note de Bază</h4>
          <p className="text-sm text-amber-700">{product.notes_base.join(", ")}</p>
        </div>
      </div>
    )}
  </div>
</CardContent>
    </Card>
  );

  const ProductSpecs = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5" />
          <span>Specificații Parfum</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div>
              <p className="font-medium text-muted-foreground">Brand</p>
              <p className="font-medium">{product.brand}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Concentrație</p>
              <p className="font-medium">{product.concentration}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Familie Olfactivă</p>
              <p className="font-medium">{product.family}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-muted-foreground">Anul Lansării</p>
              <p className="font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {product.launch_year}
              </p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Gen</p>
              <p className="font-medium flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {product.gender_neutral ? "Unisex" : "Specific"}
              </p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Rating</p>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({product.review_count} recenzii)</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fragrantica Button */}
        <div className="mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              const searchQuery = `${product.brand} ${product.name}`.replace(/\s+/g, '+');
              window.open(`https://www.fragrantica.com/search/?query=${searchQuery}`, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Vezi pe Fragrantica
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const DetailedDescription = () => (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Despre Acest Parfum</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-gray max-w-none">
          <p className="text-base leading-relaxed mb-6">
            {product.description}
          </p>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
            <h4 className="text-lg font-semibold mb-4 text-purple-900">Experiența Olfactivă</h4>
            <p className="text-purple-800 leading-relaxed">
              Acest parfum este o creație unică care combină elemente clasice cu note moderne, 
              oferind o experiență olfactivă memorabilă. Fiecare notă a fost aleasă cu grijă 
              pentru a crea o armonie perfectă care evoluează frumos pe parcursul zilei.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h5 className="font-semibold text-blue-900 mb-2">Caracteristici Principale</h5>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Parfum de lungă durată</li>
                <li>• Compoziție complexă și rafinată</li>
                <li>• Potrivit pentru multiple ocazii</li>
                <li>• Ingredient de înaltă calitate</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h5 className="font-semibold text-green-900 mb-2">Momentul Perfect</h5>
              <p className="text-green-800 text-sm leading-relaxed">
                Acest parfum se potrivește perfect pentru {product.gender_neutral ? 'oricine' : 'persoanele'} 
                care apreciază eleganța și rafinamentul în fiecare detaliu al vieții lor.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PerformanceInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Timer className="h-5 w-5" />
          <span>Longevitate & Proiecție</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Longevitate</p>
              <span className="text-sm text-muted-foreground">6-8 ore</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full" style={{width: '75%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Proiecție</p>
              <span className="text-sm text-muted-foreground">Moderată</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full" style={{width: '65%'}}></div>
            </div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>Nota:</strong> Longevitatea și proiecția pot varia în funcție de tipul de piele, 
              condițiile meteorologice și alte factori individuali.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OccasionsInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Ocazii de Purtare</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Badge variant="outline" className="justify-center py-2">Zi</Badge>
            <Badge variant="outline" className="justify-center py-2">Seară</Badge>
            <Badge variant="outline" className="justify-center py-2">Birou</Badge>
            <Badge variant="outline" className="justify-center py-2">Casual</Badge>
            <Badge variant="outline" className="justify-center py-2">Primăvară</Badge>
            <Badge variant="outline" className="justify-center py-2">Vară</Badge>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h5 className="font-semibold text-indigo-900 mb-2">Versatilitate</h5>
            <p className="text-indigo-800 text-sm leading-relaxed">
              Acest parfum se adaptează perfect la diferite contexte sociale și profesionale, 
              fiind ideal atât pentru întâlnirile informale, cât și pentru evenimentele speciale.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleAddToCart = () => {
    if (!currentSKU) return;
    addItem({
      id: product.id,
      skuId: currentSKU.id,
      type: 'product',
      name: product.name,
      brand: product.brand,
      image: product.image_url,
      sizeLabel: currentSKU.label,
      quantity,
      price: Math.round(currentSKU.price / 100), // convert bani to Lei
    });
    triggerAnimation();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={`${product.name} de la ${product.brand} | Parfum Niche | Scent Discovery Vault`}
        description={product.description}
        image={product.image_url}
        url={`https://scent-discovery-vault.com/product/${product.id}`}
        type="product"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "brand": { "@type": "Brand", "name": product.brand },
            "description": product.description,
            "image": product.image_url,
            "offers": {
              "@type": "Offer",
              "availability": "https://schema.org/InStock",
              "priceCurrency": "MDL",
              "price": (skus && skus.length > 0) ? skus[0].price : 0,
              "url": `https://scent-discovery-vault.com/product/${product.id}`
            }
          })}
        </script>
      </Seo>
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate('/shop');
                }
              }}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Înapoi la produse</span>
            </Button>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Product Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-sm">{product.brand}</Badge>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-playfair font-medium leading-tight">
                  {product.name}
                </h1>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Product Image */}
              <div className="max-w-md mx-auto aspect-square overflow-hidden rounded-xl bg-white p-4">
  <img
    src={imageError || !product.image_url ? fallbackImage : product.image_url}
    alt={product.name}
    className="w-full h-full object-contain"  // ✅ object-contain
    loading="lazy"
    onError={handleImageError}
  />
</div>

              {/* Mobile Purchase Options - Show after image on mobile only */}
              <div className="lg:hidden">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Size Selection */}
                      {skus && skus.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="font-medium">Selectează Dimensiunea</h3>
                          {/* Deduplicate SKUs by size_ml and price */}
                          {(() => {
                            const seen = new Set();
                            const uniqueSkus = skus.filter((sku) => {
                              const key = sku.size_ml + '|' + sku.price;
                              if (seen.has(key)) return false;
                              seen.add(key);
                              return true;
                            });
                            return (
                              <RadioGroup 
                                value={selectedSKU} 
                                onValueChange={setSelectedSKU}
                                defaultValue={uniqueSkus.find(sku => sku.size_ml === 100)?.id || uniqueSkus[0]?.id}
                              >
                                <div className="space-y-3">
                                  {uniqueSkus.map((sku) => {
                                    const isFullBottle = sku.size_ml >= 50;
                                    return (
                                      <div 
                                        key={sku.id} 
                                        className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                                          isFullBottle ? 'border-primary bg-primary/5' : ''
                                        }`}
                                      >
                                        <RadioGroupItem value={sku.id} id={sku.id} />
                                        <Label 
                                          htmlFor={sku.id} 
                                          className="flex-1 flex justify-between items-center cursor-pointer"
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">{sku.label}</span>
                                            {isFullBottle && (
                                              <span className="text-xs text-primary font-medium">Sticlă Completă</span>
                                            )}
                                          </div>
                                          <span className="font-semibold">{formatPrice(sku.price)}</span>
                                        </Label>
                                      </div>
                                    );
                                  })}
                                </div>
                              </RadioGroup>
                            );
                          })()}
                        </div>
                      )}

                      {/* Quantity and Price */}
                      {currentSKU && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Cantitate</span>
                            <div className="flex items-center border border-border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="rounded-r-none h-10 w-10"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="px-4 py-2 text-center min-w-[60px] font-medium">
                                {quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setQuantity(quantity + 1)}
                                className="rounded-l-none h-10 w-10"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Preț Total</p>
                            <p className="text-2xl font-bold">
                              {formatPrice(currentSKU.price * quantity)}
                            </p>
                          </div>

                          <div className="space-y-3">
                            <Button
                              size="lg"
                              className={`w-full ${isAnimating ? "bg-green-500 text-white animate-pulse" : ""}`}
                              onClick={handleAddToCart}
                              disabled={isAnimating}
                            >
                              {isAnimating ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Adăugat în coș!
                                </>
                              ) : (
                                "Adaugă în Coș"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Benefits */}
                      <div className="space-y-3 pt-4 border-t">
                        <div className="text-sm space-y-2">
                          <div className="flex items-center space-x-2 text-green-600">
                            <div className="w-1 h-1 rounded-full bg-green-600"></div>
                            <span>Transport gratuit la comenzi peste 1350 Lei</span>
                          </div>
                          <div className="flex items-center space-x-2 text-green-600">
                            <div className="w-1 h-1 rounded-full bg-green-600"></div>
                            <span>Plată securizată online</span>
                          </div>
                          <div className="flex items-center space-x-2 text-green-600">
                            <div className="w-1 h-1 rounded-full bg-green-600"></div>
                            <span>Selecție de experți în parfumuri</span>
                          </div>
                          <div className="flex items-center space-x-2 text-green-600">
                            <div className="w-1 h-1 rounded-full bg-green-600"></div>
                            <span>Autenticitate garantată</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Description */}
              <DetailedDescription />

              {/* Detailed Information */}
              <div className="space-y-6">
                <FragranceNotesPyramid />
                <ProductSpecs />
                <PerformanceInfo />
                <OccasionsInfo />
              </div>
            </div>

            {/* Right Column - Purchase Options (Desktop Only) */}
            <div className="hidden lg:block space-y-6">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Size Selection */}
                    {skus && skus.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">Selectează Dimensiunea</h3>
                        {/* Deduplicate SKUs by size_ml and price */}
                        {(() => {
                          const seen = new Set();
                          const uniqueSkus = skus.filter((sku) => {
                            const key = sku.size_ml + '|' + sku.price;
                            if (seen.has(key)) return false;
                            seen.add(key);
                            return true;
                          });
                          return (
                            <RadioGroup 
                              value={selectedSKU} 
                              onValueChange={setSelectedSKU}
                              defaultValue={uniqueSkus.find(sku => sku.size_ml === 100)?.id || uniqueSkus[0]?.id}
                            >
                              <div className="space-y-3">
                                {uniqueSkus.map((sku) => {
                                  const isFullBottle = sku.size_ml >= 50;
                                  return (
                                    <div 
                                      key={sku.id} 
                                      className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                                        isFullBottle ? 'border-primary bg-primary/5' : ''
                                      }`}
                                    >
                                      <RadioGroupItem value={sku.id} id={sku.id} />
                                      <Label 
                                        htmlFor={sku.id} 
                                        className="flex-1 flex justify-between items-center cursor-pointer"
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">{sku.label}</span>
                                          {isFullBottle && (
                                            <span className="text-xs text-primary font-medium">Sticlă Completă</span>
                                          )}
                                        </div>
                                        <span className="font-semibold">{formatPrice(sku.price)}</span>
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            </RadioGroup>
                          );
                        })()}
                      </div>
                    )}

                    {/* Quantity and Price */}
                    {currentSKU && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Cantitate</span>
                          <div className="flex items-center border border-border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              className="rounded-r-none h-10 w-10"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-4 py-2 text-center min-w-[60px] font-medium">
                              {quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setQuantity(quantity + 1)}
                              className="rounded-l-none h-10 w-10"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Preț Total</p>
                          <p className="text-2xl font-bold">
                            {formatPrice(currentSKU.price * quantity)}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <Button
                            size="lg"
                            className={`w-full ${isAnimating ? "bg-green-500 text-white animate-pulse" : ""}`}
                            onClick={handleAddToCart}
                            disabled={isAnimating}
                          >
                            {isAnimating ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Adăugat în coș!
                              </>
                            ) : (
                              "Adaugă în Coș"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="text-sm space-y-2">
                        <div className="flex items-center space-x-2 text-green-600">
                          <div className="w-1 h-1 rounded-full bg-green-600"></div>
                          <span>Transport gratuit la comenzi peste 1350 Lei</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-600">
                          <div className="w-1 h-1 rounded-full bg-green-600"></div>
                          <span>Plată securizată online</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-600">
                          <div className="w-1 h-1 rounded-full bg-green-600"></div>
                          <span>Selecție de experți în parfumuri</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-600">
                          <div className="w-1 h-1 rounded-full bg-green-600"></div>
                          <span>Autenticitate garantată</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Product;
