import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Building2, 
  Database, 
  Target, 
  Scale, 
  Users, 
  Clock, 
  Lock, 
  Cookie, 
  Globe, 
  FileText,
  Mail,
  Phone,
  CheckCircle2
} from "lucide-react";

const Privacy = () => {
  const currentDate = new Date().toLocaleDateString('ro-RO', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Politica de Confidențialitate | Modest.Shops"
        description="Politica de confidențialitate Modest.Shops. Află cum protejăm și prelucrăm datele tale personale în conformitate cu legislația Republicii Moldova."
        url="https://modest.shops/privacy"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/20 to-accent/10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-medium tracking-tight">
                Politica de Confidențialitate
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
                    Prezenta Politică de Confidențialitate descrie modul în care <strong>Modest.Shops</strong> prelucrează 
                    datele cu caracter personal ale utilizatorilor, în conformitate cu Legea nr. 133 din 08.07.2011 privind 
                    protecția datelor cu caracter personal din Republica Moldova.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Prin utilizarea acestui website, sunteți de acord cu termenii acestei politici.
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
              
              {/* 1. Operatorul de date */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        1. Operatorul de date
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>Operatorul datelor cu caracter personal este:</p>
                        <div className="space-y-2 pt-2">
                          <p><strong>Denumire:</strong> Modest.Shops</p>
                          <p><strong>Sediu:</strong> Strada Ștefan cel Mare 123, Chișinău, MD-2004, Republica Moldova</p>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <span><strong>Email:</strong> <a href="mailto:contact@modest.shops" className="text-primary hover:underline">contact@modest.shops</a></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-primary" />
                            <span><strong>Telefon:</strong> <a href="tel:+37360123456" className="text-primary hover:underline">+373 60 123 456</a></span>
                          </div>
                        </div>
                        <p className="pt-2">
                          Operatorul prelucrează datele personale în mod legal, echitabil și transparent.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Tipuri de date */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        2. Tipuri de date cu caracter personal prelucrate
                      </h2>
                      <div className="space-y-4 text-muted-foreground">
                        <p>Prelucrăm următoarele categorii de date:</p>
                        
                        <div className="bg-muted/30 rounded-lg p-4 mt-4">
                          <p className="font-medium mb-2">a) Date furnizate de utilizator</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Nume și prenume</li>
                            <li>Număr de telefon</li>
                            <li>Adresă de email</li>
                            <li>Adresă de livrare</li>
                            <li>Date necesare facturării, după caz</li>
                          </ul>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4">
                          <p className="font-medium mb-2">b) Date colectate automat</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>adresa IP</li>
                            <li>tipul browserului și dispozitivului</li>
                            <li>informații despre vizitele pe site</li>
                            <li>cookie-uri și tehnologii similare</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Scopurile prelucrării */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        3. Scopurile prelucrării datelor
                      </h2>
                      <p className="text-muted-foreground mb-3">
                        Datele personale sunt prelucrate pentru:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                        <li>preluarea, procesarea și livrarea comenzilor</li>
                        <li>comunicarea cu clienții</li>
                        <li>îndeplinirea obligațiilor legale</li>
                        <li>îmbunătățirea funcționării site-ului</li>
                        <li>activități de marketing (doar cu consimțământul utilizatorului)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Temeiul legal */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        4. Temeiul legal al prelucrării
                      </h2>
                      <p className="text-muted-foreground mb-3">
                        Conform legislației Republicii Moldova, datele sunt prelucrate în baza:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                        <li>consimțământului persoanei vizate</li>
                        <li>executării unui contract</li>
                        <li>obligațiilor legale ale operatorului</li>
                        <li>interesului legitim al operatorului</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 5. Destinatarii datelor */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        5. Destinatarii datelor
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>Datele pot fi transmise exclusiv către:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>companii de curierat</li>
                          <li>furnizori de servicii IT și hosting</li>
                          <li>procesatori de plăți (dacă este cazul)</li>
                          <li>autorități publice, în limitele legii</li>
                        </ul>
                        <p className="pt-2 font-medium text-foreground">
                          Nu comercializăm și nu cedăm datele personale către terți în scopuri comerciale.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 6. Durata de stocare */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        6. Durata de stocare a datelor
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>Datele cu caracter personal sunt păstrate:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>pe perioada necesară realizării scopurilor pentru care au fost colectate</li>
                          <li>conform termenelor prevăzute de legislația Republicii Moldova</li>
                        </ul>
                        <p className="pt-2">
                          Ulterior, datele vor fi șterse, distruse sau anonimizate.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 7. Drepturile persoanei vizate */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        7. Drepturile persoanei vizate
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>
                          Conform Legii nr. 133/2011, aveți următoarele drepturi:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>dreptul de informare</li>
                          <li>dreptul de acces la date</li>
                          <li>dreptul de intervenție asupra datelor</li>
                          <li>dreptul de opoziție</li>
                          <li>dreptul de a nu fi supus unei decizii individuale automate</li>
                          <li>dreptul de a vă adresa instanței de judecată</li>
                        </ul>
                        <p className="pt-2">
                          Pentru exercitarea drepturilor, ne puteți contacta la:{" "}
                          <a href="mailto:contact@modest.shops" className="text-primary hover:underline font-medium">
                            📧 contact@modest.shops
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 8. Securitatea datelor */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        8. Securitatea datelor
                      </h2>
                      <p className="text-muted-foreground">
                        Operatorul aplică măsuri tehnice și organizatorice adecvate pentru a proteja datele personale 
                        împotriva accesului neautorizat, pierderii, distrugerii sau divulgării ilegale.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 9. Cookie-uri */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Cookie className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        9. Cookie-uri
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>
                          Website-ul utilizează cookie-uri pentru a asigura funcționarea corectă și pentru analiza traficului.
                        </p>
                        <p>
                          Utilizatorul poate configura browserul pentru a accepta sau refuza cookie-urile.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 10. Transferul datelor */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        10. Transferul datelor în afara Republicii Moldova
                      </h2>
                      <p className="text-muted-foreground">
                        În cazul în care datele sunt transferate în afara Republicii Moldova, acest lucru se va face 
                        doar cu respectarea cerințelor legale și cu garanții adecvate privind protecția datelor.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 11. Modificări ale politicii */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        11. Modificări ale politicii
                      </h2>
                      <p className="text-muted-foreground">
                        Ne rezervăm dreptul de a actualiza această Politică de Confidențialitate.
                        Versiunea actualizată va fi publicată pe această pagină.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 12. Contact */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-playfair font-medium mb-4">
                        12. Contact
                      </h2>
                      <p className="text-muted-foreground mb-3">
                        Pentru orice întrebări privind protecția datelor cu caracter personal, ne puteți contacta la:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <a href="mailto:contact@modest.shops" className="text-primary hover:underline">
                            📧 contact@modest.shops
                          </a>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <a href="tel:+37360123456" className="text-primary hover:underline">
                            📞 +373 60 123 456
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acceptance Notice */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-muted/20 to-accent/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base md:text-lg font-medium">
                        ✔️ Prin utilizarea acestui website, confirmați că ați luat cunoștință de această Politică de Confidențialitate.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8 text-center">
                  <h2 className="text-2xl font-playfair font-medium mb-4">
                    Documente Legale
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Consultă și celelalte documente legale ale Modest.Shops
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/terms"
                      className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Termeni și Condiții
                    </Link>
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contactează-ne
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

export default Privacy;

