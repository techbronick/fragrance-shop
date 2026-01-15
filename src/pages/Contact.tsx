import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulare trimitere formular
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Mesaj trimis cu succes!",
        description: "Vom răspunde în cel mai scurt timp posibil.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Contactează-ne | Modest.Shops"
        description="Contactează echipa Modest.Shops pentru întrebări, suport sau informații despre produse. Suntem aici să te ajutăm!"
        url="https://modest.shops/contact"
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/20 to-accent/10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-medium tracking-tight">
                Contactează-ne
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Suntem aici să te ajutăm cu orice întrebări sau nelămuriri. 
                Echipa noastră este pregătită să răspundă la toate solicitările tale.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information & Form */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Contact Information */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-playfair font-medium mb-6">
                      Informații de Contact
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Ne poți contacta prin oricare dintre metodele de mai jos. 
                      Răspundem în cel mai scurt timp posibil.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Email */}
                    <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">Email</h3>
                            <a 
                              href="mailto:contact@modest.shops" 
                              className="text-primary hover:underline text-sm"
                            >
                              contact@modest.shops
                            </a>
                            <p className="text-xs text-muted-foreground mt-1">
                              Răspundem în 24 de ore
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Phone */}
                    <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Phone className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">Telefon</h3>
                            <a 
                              href="tel:+37360123456" 
                              className="text-primary hover:underline text-sm"
                            >
                              +373 60 123 456
                            </a>
                            <p className="text-xs text-muted-foreground mt-1">
                              Luni - Vineri: 10:00 - 18:00
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Address */}
                    <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">Adresă</h3>
                            <p className="text-sm text-muted-foreground">
                              Strada Ștefan cel Mare 123<br />
                              Chișinău, MD-2004<br />
                              Republica Moldova
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Instagram */}
                    <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Instagram className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">Instagram</h3>
                            <a 
                              href="https://www.instagram.com/modest.shops/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              @modest.shops
                            </a>
                            <p className="text-xs text-muted-foreground mt-1">
                              36.000+ urmăritori
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Working Hours */}
                    <Card className="border border-primary/10 bg-gradient-to-br from-primary/5 to-muted/20">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">Program de Lucru</h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Luni - Vineri:</span>
                                <span className="font-medium">10:00 - 18:00</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sâmbătă:</span>
                                <span className="font-medium">10:00 - 16:00</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Duminică:</span>
                                <span className="font-medium">Închis</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Contact Form */}
                <div>
                  <Card className="border-2 border-primary/10 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl font-playfair font-medium">
                        Trimite-ne un Mesaj
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        Completează formularul de mai jos și te vom contacta cât mai curând.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nume complet *</Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Introdu numele tău"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="nume@exemplu.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefon</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+373 60 123 456"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subiect *</Label>
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            placeholder="Despre ce este mesajul tău?"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Mesaj *</Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Scrie mesajul tău aici..."
                            rows={6}
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            className="resize-none"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full" 
                          size="lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Se trimite...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Trimite Mesajul
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                          Prin trimiterea acestui formular, confirmi că ai citit și acceptat{" "}
                          <a href="/terms" className="text-primary hover:underline">
                            Termenii și Condițiile
                          </a>{" "}
                          și{" "}
                          <a href="/privacy" className="text-primary hover:underline">
                            Politica de Confidențialitate
                          </a>.
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Quick Links */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-playfair font-medium mb-4">
                  Întrebări Frecvente
                </h2>
                <p className="text-muted-foreground">
                  Poate găsești răspunsul la întrebarea ta în secțiunea noastră de FAQ.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border border-primary/10 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-medium mb-2">Livrare</h3>
                    <p className="text-sm text-muted-foreground">
                      Informații despre termenii și costurile de livrare
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-primary/10 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-medium mb-2">Retururi</h3>
                    <p className="text-sm text-muted-foreground">
                      Politica noastră de retur și schimb
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-primary/10 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-medium mb-2">Produse</h3>
                    <p className="text-sm text-muted-foreground">
                      Întrebări despre produsele noastre
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;

