import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Building2, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  Shield, 
  Copyright, 
  Lock, 
  AlertTriangle,
  Scale,
  Mail,
  Phone,
  Instagram
} from "lucide-react";

const Terms = () => {
  const currentDate = new Date().toLocaleDateString('ro-RO', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Termeni și Condiții | Modest.Shops"
        description="Termenii și condițiile de utilizare a site-ului Modest.Shops. Citește cu atenție informațiile despre produse, comenzi, livrare, retur și protecția datelor personale."
        url="https://modest.shops/terms"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/20 to-accent/10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-medium tracking-tight">
                Termeni și Condiții
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Ultima actualizare: {currentDate}
              </p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <p className="text-muted-foreground leading-relaxed">
                    Bine ați venit pe website-ul <strong>Modest.Shops</strong> („Site-ul").
                    Utilizarea acestui site implică acceptarea termenilor și condițiilor de mai jos. 
                    Vă rugăm să citiți cu atenție acest document înainte de a plasa o comandă sau de a utiliza serviciile noastre.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* 1. Informații generale */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        1. Informații generale
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>
                          Website-ul <strong>Modest.Shops</strong> este operat de <strong>Modest.Shops</strong>, 
                          cu sediul în <strong>Chișinău, Republica Moldova</strong>.
                        </p>
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <span>Email: <a href="mailto:contact@modest.shops" className="text-primary hover:underline">contact@modest.shops</a></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-primary" />
                            <span>Telefon: <a href="tel:+373" className="text-primary hover:underline">[____]</a></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Instagram className="h-4 w-4 text-primary" />
                            <span>Instagram: <a href="https://www.instagram.com/modest.shops/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@modest.shops</a></span>
                          </div>
                        </div>
                        <p className="pt-2">
                          Ne rezervăm dreptul de a modifica oricând acești Termeni și Condiții, fără o notificare prealabilă. 
                          Versiunea actualizată va fi publicată pe site.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Definiții */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        2. Definiții
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p><strong>Vânzător</strong> – Modest.Shops</p>
                        <p><strong>Client / Utilizator</strong> – orice persoană fizică sau juridică ce accesează site-ul și/sau plasează o comandă</p>
                        <p><strong>Produse</strong> – parfumuri și alte articole afișate spre vânzare pe site</p>
                        <p><strong>Comandă</strong> – document electronic prin care Clientul solicită achiziționarea produselor</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Produse și autenticitate */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        3. Produse și autenticitate
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>
                          Toate produsele comercializate pe site sunt <strong>originale și autentice</strong>.
                        </p>
                        <p>
                          Imaginile produselor sunt cu titlu de prezentare și pot exista mici diferențe de ambalaj sau culoare 
                          față de produsul livrat, în funcție de lotul producătorului.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Plasarea comenzilor */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        4. Plasarea comenzilor
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>Comenzile pot fi plasate online, 24/7</p>
                        <p>După plasarea comenzii, Clientul va primi o confirmare prin email / telefon / mesaj</p>
                        <p className="pt-2"><strong>Ne rezervăm dreptul de a refuza o comandă în cazul:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>lipsei stocului</li>
                          <li>informațiilor incomplete sau incorecte</li>
                          <li>suspiciunilor de fraudă</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 5. Prețuri și plăți */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        5. Prețuri și plăți
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>Toate prețurile sunt afișate în <strong>MDL (Lei)</strong></p>
                        <p>Prețurile pot fi modificate fără notificare prealabilă</p>
                        <p className="pt-2"><strong>Metode de plată acceptate:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>ramburs</li>
                          <li>transfer bancar</li>
                          <li>online (dacă este cazul)</li>
                        </ul>
                        <p className="pt-2">
                          Costurile de livrare pot fi afișate separat, în funcție de locație.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 6. Livrare */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        6. Livrare
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>Livrarea se face pe teritoriul <strong>Republicii Moldova</strong></p>
                        <p className="pt-2"><strong>Termenul estimat de livrare este:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li><strong>produse în stoc:</strong> 1–3 zile lucrătoare</li>
                          <li><strong>produse la comandă:</strong> 7–10 zile lucrătoare</li>
                        </ul>
                        <p className="pt-2">
                          Întârzierile cauzate de curieri sau factori externi nu sunt responsabilitatea Vânzătorului.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 7. Dreptul de retur */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <RotateCcw className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        7. Dreptul de retur
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>
                          Clientul are dreptul de a returna produsele în termen de <strong>14 zile calendaristice</strong>, 
                          conform legislației în vigoare, cu următoarele condiții:
                        </p>
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
                          <p className="font-medium text-destructive mb-2">❌ Produsele NU pot fi returnate dacă:</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>au fost desigilate</li>
                            <li>au fost utilizate</li>
                            <li>prezintă urme de deteriorare</li>
                          </ul>
                        </div>
                        <p className="pt-2">
                          Produsele trebuie returnate în ambalajul original, sigilat, cu toate accesoriile incluse.
                        </p>
                        <p>
                          Costurile de retur sunt suportate de Client, cu excepția cazurilor în care produsul este defect 
                          sau livrat greșit.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 8. Garanții și reclamații */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        8. Garanții și reclamații
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>
                          În cazul unui produs defect sau livrat eronat, Clientul este rugat să ne contacteze în maximum 
                          <strong> 48 de ore</strong> de la primirea coletului.
                        </p>
                        <p className="pt-2">
                          Reclamațiile pot fi trimise la:{" "}
                          <a href="mailto:contact@modest.shops" className="text-primary hover:underline font-medium">
                            📧 contact@modest.shops
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 9. Drepturi de proprietate intelectuală */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Copyright className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        9. Drepturi de proprietate intelectuală
                      </h2>
                      <p className="text-muted-foreground">
                        Întregul conținut al site-ului (texte, imagini, logo-uri, design) este proprietatea 
                        <strong> Modest.Shops</strong> și nu poate fi copiat, distribuit sau utilizat fără acordul scris al Vânzătorului.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 10. Protecția datelor personale */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        10. Protecția datelor personale
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p><strong>Datele personale colectate sunt utilizate exclusiv pentru:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>procesarea comenzilor</li>
                          <li>comunicarea cu clienții</li>
                          <li>îmbunătățirea serviciilor</li>
                        </ul>
                        <p className="pt-2">
                          Pentru mai multe informații, consultați pagina{" "}
                          <Link to="/privacy" className="text-primary hover:underline font-medium">
                            Politica de Confidențialitate
                          </Link>.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 11. Limitarea răspunderii */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        11. Limitarea răspunderii
                      </h2>
                      <p className="text-muted-foreground mb-3">
                        Vânzătorul nu este responsabil pentru:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                        <li>utilizarea necorespunzătoare a produselor</li>
                        <li>
                          reacții alergice cauzate de ingrediente (Clientul are obligația de a verifica lista ingredientelor)
                        </li>
                        <li>erori tehnice temporare ale site-ului</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 12. Legea aplicabilă */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        12. Legea aplicabilă
                      </h2>
                      <p className="text-muted-foreground">
                        Acești Termeni și Condiții sunt guvernați de legislația <strong>Republicii Moldova</strong>.
                        Orice litigiu va fi soluționat pe cale amiabilă sau, în caz contrar, de instanțele competente.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acceptance Notice */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-muted/20 to-accent/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base md:text-lg font-medium">
                        📌 Prin utilizarea acestui site, confirmați că ați citit, înțeles și acceptat acești Termeni și Condiții.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8 text-center">
                  <h2 className="text-2xl font-playfair font-medium mb-4">
                    Ai întrebări despre Termenii și Condițiile noastre?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Suntem aici să te ajutăm. Contactează-ne pentru orice clarificări.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="mailto:contact@modest.shops"
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Trimite Email
                    </a>
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium"
                    >
                      Pagina de Contact
                    </Link>
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

export default Terms;

