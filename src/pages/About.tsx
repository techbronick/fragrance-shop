import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  Package, 
  Globe, 
  Target, 
  Instagram, 
  Award,
  Heart,
  ShoppingBag,
  Star,
  Users
} from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Despre Modest.Shops | Parfumuri Niche și Orientale din Chișinău"
        description="Modest.Shops este un brand/retailer local din Chișinău specializat în parfumuri niche și orientale. Descoperă colecții atent selecționate de parfumuri originale pentru cei care apreciază autenticitatea și calitatea excepțională."
        url="https://modest.shops/about"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/20 to-accent/10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-medium tracking-tight">
                Despre Modest.Shops
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Un brand local din Chișinău care aduce pe piața din Moldova colecții atent selecționate 
                de parfumuri originale, create pentru cei care apreciază autenticitatea, emoția și calitatea excepțională.
              </p>
            </div>
          </div>
        </section>

        {/* Main About Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-primary/10 shadow-lg">
                <CardContent className="p-8 md:p-12">
                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-playfair font-medium mb-4">
                          Despre Modest.Shops
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                          Modest.Shops este un brand/retailer local din Chișinău specializat în parfumuri niche și orientale, 
                          care aduce pe piața din Moldova colecții atent selecționate de parfumuri originale, create pentru 
                          cei care apreciază autenticitatea, emoția și calitatea excepțională.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-playfair font-medium mb-4">
                  Ce Oferim
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  La Modest.Shops găsești parfumuri care transformă fiecare moment într-o experiență senzorială unică.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border border-primary/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-playfair font-medium mb-3">
                      Parfumuri Niche și Orientale Autentice
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Produse din colecții rare și sofisticate, care aduc experiențe senzoriale unice. 
                      Fiecare parfum este ales cu grijă pentru a satisface gusturile clienților care caută 
                      emoție, eleganță și rafinament într-o sticlă.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-playfair font-medium mb-3">
                      Branduri Originale Internaționale
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Doar produse de înaltă calitate, non-imitate. Colaborăm exclusiv cu case de parfumuri 
                      respectate pentru a-ți oferi autenticitate garantată în fiecare sticlă.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-playfair font-medium mb-3">
                      Comandă la Cerere
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Posibilitatea de comandă la cerere, inclusiv parfumuri care nu sunt în stoc, 
                      cu livrare în 7–10 zile. Găsește-ți parfumul perfect, chiar dacă nu este disponibil imediat.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Our Presence Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <Globe className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-playfair font-medium">
                    Prezența Noastră
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                    Suntem activi pe Instagram, unde avem o comunitate puternică și pasionată de peste 
                    <span className="font-semibold text-primary"> 36.000 de urmăritori</span>. Acolo prezentăm 
                    colecții, noutăți și recomandări de parfumuri, dar și momente inspiraționale din universul aromelor.
                  </p>
                  <a
                    href="https://www.instagram.com/modest.shops/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <Instagram className="h-5 w-5" />
                    <span>Urmărește-ne pe Instagram</span>
                  </a>
                </div>
                <div className="relative">
                  <Card className="border-2 border-primary/10 shadow-lg">
                    <CardContent className="p-8 bg-gradient-to-br from-primary/5 to-muted/20">
                      <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mx-auto">
                          <Users className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <div className="text-4xl md:text-5xl font-playfair font-medium text-primary">
                            36.000+
                          </div>
                          <div className="text-muted-foreground font-medium">
                            Urmăritori pe Instagram
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground pt-4">
                          O comunitate pasionată de parfumuri niche și orientale
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Vision Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-playfair font-medium mb-4">
                  Viziunea Noastră
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  La Modest.Shops, ne dorim să fim mai mult decât un simplu retailer de parfumuri.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border border-primary/10 bg-background/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-playfair font-medium mb-3">
                      Punct de Referință
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Punctul de referință pentru pasionații de parfumuri niche din Moldova și regiune.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 bg-background/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-playfair font-medium mb-3">
                      Spațiu de Emoție
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Un spațiu unde calitatea întâlnește emoția, iar fiecare parfum este o poveste.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 bg-background/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-playfair font-medium mb-3">
                      Brand de Încredere
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Un brand în care clienții au încredere, pentru cele mai originale selecții de produse.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-muted/20 to-accent/10 shadow-xl">
                <CardContent className="p-8 md:p-12 text-center">
                  <div className="space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mx-auto">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-playfair font-medium">
                      Descoperă Colecția Noastră
                    </h2>
                    <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
                      Explorează parfumurile noastre selectate cu grijă și găsește-ți următorul parfum semnătură. 
                      Fiecare aromă spune o poveste unică.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <Link
                        to="/shop"
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Explorează Magazinul
                      </Link>
                      <Link
                        to="/discovery-sets"
                        className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Seturi Discovery
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;

