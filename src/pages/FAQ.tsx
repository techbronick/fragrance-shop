import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { 
  HelpCircle, 
  Building2, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  Shield, 
  Lock, 
  Mail,
  Phone,
  Instagram,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

const FAQ = () => {
  const handleAccordionChange = (value: string) => {
    // Scroll to the expanded accordion item
    if (value) {
      setTimeout(() => {
        // Find the accordion item by data attribute
        const accordionElement = document.querySelector(`[data-accordion-item="${value}"]`);
        if (accordionElement) {
          const headerOffset = 80; // Header height + some padding
          const elementPosition = accordionElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 150); // Wait for accordion animation to start
    }
  };
  
  const faqSections = [
    {
      id: "about",
      title: "Despre Modest.Shops",
      icon: Building2,
      items: [
        {
          question: "Ce este Modest.Shops?",
          answer: "Modest.Shops este un brand din Republica Moldova, specializat în parfumuri originale, niche și orientale, atent selecționate pentru persoanele care caută arome deosebite și autentice."
        },
        {
          question: "Unde este localizat Modest.Shops?",
          answer: "Activitatea Modest.Shops este concentrată în Chișinău, Republica Moldova, cu livrări pe teritoriul țării."
        },
        {
          question: "Produsele sunt originale?",
          answer: "Da. Toate produsele comercializate de Modest.Shops sunt 100% originale. Lucrăm exclusiv cu parfumuri autentice, provenite de la furnizori de încredere."
        }
      ]
    },
    {
      id: "products",
      title: "Produse",
      icon: Package,
      items: [
        {
          question: "Ce tipuri de parfumuri pot găsi?",
          answer: (
            <div className="space-y-2">
              <p>În oferta Modest.Shops găsești:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>parfumuri niche</li>
                <li>parfumuri orientale</li>
                <li>arome intense, rare și premium</li>
                <li>branduri internaționale cunoscute în lumea parfumurilor</li>
              </ul>
            </div>
          )
        },
        {
          question: "Parfumurile sunt sigilate?",
          answer: "Da. Toate parfumurile sunt livrate sigilate, în ambalajul original al producătorului, cu excepția cazurilor în care este menționat clar altfel (ex: decant)."
        },
        {
          question: "Oferiți parfumuri la comandă?",
          answer: "Da. Dacă un produs nu este în stoc, acesta poate fi comandat special, cu un termen estimativ de livrare de 7–10 zile lucrătoare."
        }
      ]
    },
    {
      id: "orders",
      title: "Comenzi",
      icon: ShoppingCart,
      items: [
        {
          question: "Cum pot plasa o comandă?",
          answer: (
            <div className="space-y-2">
              <p>Comenzile pot fi plasate:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>direct pe website</li>
                <li>prin mesaj (Instagram / telefon), în funcție de opțiunile disponibile</li>
              </ul>
              <p className="pt-2">După plasarea comenzii, vei fi contactat pentru confirmare.</p>
            </div>
          )
        },
        {
          question: "Pot anula o comandă?",
          answer: "Da, o comandă poate fi anulată înainte de expediere. Pentru anulare, te rugăm să ne contactezi cât mai rapid."
        }
      ]
    },
    {
      id: "payment",
      title: "Plată",
      icon: CreditCard,
      items: [
        {
          question: "Ce metode de plată sunt disponibile?",
          answer: (
            <div className="space-y-2">
              <p>Metodele de plată pot include:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>plata ramburs la livrare</li>
                <li>transfer bancar</li>
                <li>plată online (dacă este disponibilă pe site)</li>
              </ul>
              <p className="pt-2">Metoda exactă va fi afișată în procesul de comandă.</p>
            </div>
          )
        }
      ]
    },
    {
      id: "shipping",
      title: "Livrare",
      icon: Truck,
      items: [
        {
          question: "Unde livrați?",
          answer: "Livrăm pe întreg teritoriul Republicii Moldova."
        },
        {
          question: "În cât timp ajunge comanda?",
          answer: (
            <div className="space-y-2">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Produse în stoc:</strong> 1–3 zile lucrătoare</li>
                <li><strong>Produse la comandă:</strong> 7–10 zile lucrătoare</li>
              </ul>
              <p className="pt-2">Termenul poate varia în funcție de curier și localitate.</p>
            </div>
          )
        },
        {
          question: "Care este costul livrării?",
          answer: "Costul livrării este afișat la finalizarea comenzii și poate varia în funcție de destinație."
        }
      ]
    },
    {
      id: "returns",
      title: "Retururi și reclamații",
      icon: RotateCcw,
      items: [
        {
          question: "Pot returna un produs?",
          answer: "Da, conform legislației Republicii Moldova, produsele pot fi returnate în termen de 14 zile calendaristice, doar dacă sunt sigilate și neutilizate."
        },
        {
          question: "De ce nu pot returna un parfum desigilat?",
          answer: "Din motive de igienă și siguranță, parfumurile desigilate sau utilizate nu pot fi returnate."
        },
        {
          question: "Ce fac dacă primesc un produs greșit sau defect?",
          answer: "Te rugăm să ne contactezi în termen de 48 de ore de la primirea coletului, iar echipa noastră va soluționa situația cât mai rapid."
        }
      ]
    },
    {
      id: "warranty",
      title: "Garanții și siguranță",
      icon: Shield,
      items: [
        {
          question: "Parfumurile pot provoca alergii?",
          answer: (
            <div className="space-y-2">
              <p>Ca orice produs cosmetic, parfumurile pot provoca reacții alergice. Recomandăm verificarea ingredientelor și testarea produsului cu atenție.</p>
              <p className="pt-2"><strong>Modest.Shops nu este responsabil pentru reacții alergice individuale.</strong></p>
            </div>
          )
        }
      ]
    },
    {
      id: "account",
      title: "Cont și date personale",
      icon: Lock,
      items: [
        {
          question: "Trebuie să îmi creez cont pentru a comanda?",
          answer: "Nu neapărat. Poți plasa comenzi și fără cont, în funcție de opțiunile site-ului."
        },
        {
          question: "Cum sunt protejate datele mele?",
          answer: (
            <div className="space-y-2">
              <p>Datele tale sunt protejate conform Legii nr. 133/2011 privind protecția datelor cu caracter personal din Republica Moldova.</p>
              <p className="pt-2">
                Mai multe detalii găsești în pagina{" "}
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  Politica de Confidențialitate
                </Link>.
              </p>
            </div>
          )
        }
      ]
    },
    {
      id: "contact",
      title: "Contact",
      icon: Mail,
      items: [
        {
          question: "Cum pot lua legătura cu Modest.Shops?",
          answer: (
            <div className="space-y-3">
              <p>Ne poți contacta prin:</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Instagram className="h-4 w-4 text-primary" />
                  <span>
                    <strong>Instagram:</strong>{" "}
                    <a href="https://www.instagram.com/modest.shops/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      @modest.shops
                    </a>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:contact@modest.shops" className="text-primary hover:underline">
                      contact@modest.shops
                    </a>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>
                    <strong>Telefon:</strong>{" "}
                    <a href="tel:+37360123456" className="text-primary hover:underline">
                      +373 60 123 456
                    </a>
                  </span>
                </div>
              </div>
            </div>
          )
        },
        {
          question: "Oferiți consultanță în alegerea parfumului?",
          answer: "Da. Suntem bucuroși să te ajutăm cu recomandări personalizate, în funcție de preferințele tale."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Întrebări Frecvente (FAQ) | Modest.Shops"
        description="Găsește răspunsuri la cele mai frecvente întrebări despre Modest.Shops, produse, comenzi, livrare, retururi și multe altele."
        url="https://modest.shops/faq"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/20 to-accent/10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <HelpCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-medium tracking-tight">
                Întrebări Frecvente
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Găsește răspunsuri rapide la cele mai comune întrebări despre produse, comenzi, livrare și serviciile noastre.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {faqSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card key={section.id} className="border border-primary/10">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-playfair font-medium">
                          {section.title}
                        </h2>
                      </div>
                      <Accordion 
                        type="single" 
                        collapsible 
                        className="w-full"
                        onValueChange={handleAccordionChange}
                      >
                        {section.items.map((item, index) => {
                          const itemValue = `item-${section.id}-${index}`;
                          return (
                            <div key={index} data-accordion-item={itemValue} className="scroll-mt-20">
                              <AccordionItem value={itemValue}>
                                <AccordionTrigger className="text-left font-medium">
                                  {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                  {typeof item.answer === 'string' ? (
                                    <p>{item.answer}</p>
                                  ) : (
                                    item.answer
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            </div>
                          );
                        })}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-muted/20 to-accent/10 shadow-xl">
                <CardContent className="p-8 md:p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-playfair font-medium mb-4">
                    Ai alte întrebări?
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    Dacă ai alte întrebări, nu ezita să ne contactezi — suntem aici să te ajutăm.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contactează-ne
                    </Link>
                    <a
                      href="https://www.instagram.com/modest.shops/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium"
                    >
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-playfair font-medium mb-4">
                  Informații Suplimentare
                </h2>
                <p className="text-muted-foreground">
                  Consultă și celelalte pagini pentru mai multe detalii
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to="/terms">
                  <Card className="border border-primary/10 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-medium mb-2">Termeni și Condiții</h3>
                      <p className="text-sm text-muted-foreground">
                        Condițiile de utilizare și servicii
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/privacy">
                  <Card className="border border-primary/10 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-medium mb-2">Politica de Confidențialitate</h3>
                      <p className="text-sm text-muted-foreground">
                        Protecția datelor personale
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/contact">
                  <Card className="border border-primary/10 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-medium mb-2">Contact</h3>
                      <p className="text-sm text-muted-foreground">
                        Trimite-ne un mesaj
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;

