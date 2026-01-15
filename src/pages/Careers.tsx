import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Heart, 
  TrendingUp, 
  Award,
  Mail,
  Instagram,
  Sparkles,
  Target,
  Lightbulb,
  Handshake
} from "lucide-react";

const Careers = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Cariere | Modest.Shops"
        description="Alătură-te echipei Modest.Shops! Căutăm persoane pasionate de parfumuri, calitate și experiențe autentice. Descoperă oportunitățile de carieră."
        url="https://modest.shops/careers"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/20 to-accent/10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Briefcase className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-medium tracking-tight">
                Cariere
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Alătură-te echipei Modest.Shops
              </p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-primary/10 shadow-lg">
                <CardContent className="p-8 md:p-12">
                  <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                      La <strong>Modest.Shops</strong>, credem că un brand puternic se construiește de oameni pasionați, 
                      creativi și dedicați. Suntem mereu în căutarea persoanelor care împărtășesc dragostea pentru 
                      parfumuri, calitate și experiențe autentice.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                      Dacă îți dorești să lucrezi într-un mediu dinamic, unde ideile sunt apreciate și pasiunea contează, 
                      s-ar putea să fim potriviți unul pentru celălalt.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Work With Us */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-playfair font-medium mb-4">
                  De ce să lucrezi cu noi?
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border border-primary/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-playfair font-medium mb-2">
                      Mediu de lucru prietenos
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Mediu de lucru prietenos și motivant, unde fiecare membru al echipei este valorificat.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-playfair font-medium mb-2">
                      Brand în creștere
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Brand în creștere, cu viziune pe termen lung și oportunități reale de dezvoltare.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-playfair font-medium mb-2">
                      Produse premium
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Posibilitatea de a lucra cu produse premium și niche, parfumuri autentice și de calitate.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-playfair font-medium mb-2">
                      Dezvoltare profesională
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Oportunități reale de dezvoltare profesională și creștere în cadrul echipei.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-playfair font-medium mb-2">
                      Implicare directă
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Implicare directă în evoluția brandului și în luarea deciziilor importante.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Handshake className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-playfair font-medium mb-2">
                      Responsabilitate și încredere
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Punem accent pe responsabilitate, încredere și colaborare în echipă.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Who We're Looking For */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-playfair font-medium mb-4">
                  Pe cine căutăm?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Căutăm persoane care împărtășesc valorile noastre și pasiunea pentru parfumuri.
                </p>
              </div>

              <Card className="border-2 border-primary/10 shadow-lg">
                <CardContent className="p-8 md:p-10">
                  <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      Căutăm persoane care:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">
                          sunt pasionate de domeniul beauty / parfumuri / retail
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">
                          sunt responsabile și orientate către client
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">
                          comunică clar și profesionist
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">
                          sunt deschise să învețe și să evolueze
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">
                          apreciază munca în echipă
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-muted-foreground italic">
                        Experiența este un avantaj, dar atitudinea și dorința de implicare contează cel mai mult.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Available Positions */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-playfair font-medium mb-4">
                  Poziții disponibile
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  În funcție de necesități, pot exista oportunități pentru diferite roluri.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-playfair font-medium">
                        Consultanți vânzări
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ajută clienții să găsească parfumul perfect și oferă consultanță profesională.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-playfair font-medium">
                        Customer support
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Asigură relații excelente cu clienții și rezolvă solicitările cu promptitudine.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Instagram className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-playfair font-medium">
                        Social media & content
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Creează conținut atractiv și gestionează prezența online a brandului.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-playfair font-medium">
                        Logistică și procesare
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Gestionează comenzile și asigură livrarea corectă a produselor către clienți.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-muted/20 mt-6">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    <strong>Chiar dacă nu vezi o poziție listată, ne poți trimite candidatura ta.</strong>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How to Apply */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-playfair font-medium mb-4">
                  Cum poți aplica?
                </h2>
              </div>

              <Card className="border-2 border-primary/10 shadow-lg">
                <CardContent className="p-8 md:p-10">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-playfair font-medium mb-4">
                        Trimite-ne:
                      </h3>
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex items-start space-x-3">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>CV-ul tău</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>câteva rânduri despre tine și de ce vrei să faci parte din echipa noastră</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-6 border-t border-border space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Email:</p>
                          <a 
                            href="mailto:contact@modest.shops?subject=Cariere – [Numele tău]" 
                            className="text-primary hover:underline"
                          >
                            contact@modest.shops
                          </a>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">
                        📌 Subiect: Cariere – [Numele tău]
                      </p>
                      <div className="flex items-center space-x-3 pt-2">
                        <Instagram className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Sau scrie-ne direct pe Instagram:</p>
                          <a 
                            href="https://www.instagram.com/modest.shops/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            @modest.shops
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Equal Opportunities */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Handshake className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-playfair font-medium mb-3">
                    Egalitate de șanse
                  </h3>
                  <p className="text-muted-foreground">
                    <strong>Modest.Shops</strong> oferă șanse egale tuturor candidaților, fără discriminare de gen, 
                    vârstă, religie sau alte criterii, în conformitate cu legislația Republicii Moldova.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-muted/20 to-accent/10 shadow-xl">
                <CardContent className="p-8 md:p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-playfair font-medium mb-4">
                    Hai să construim împreună un brand care inspiră
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    Dacă împărtășești pasiunea noastră pentru parfumuri și vrei să faci parte dintr-o echipă 
                    dedicată, așteptăm să te cunoaștem!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="mailto:contact@modest.shops?subject=Cariere – Candidatură"
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Trimite Candidatura
                    </a>
                    <a
                      href="https://www.instagram.com/modest.shops/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium"
                    >
                      <Instagram className="h-4 w-4 mr-2" />
                      Contactează-ne pe Instagram
                    </a>
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

export default Careers;

