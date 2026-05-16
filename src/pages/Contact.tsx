import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageMeta } from "@/hooks/usePageMeta";
import { JsonLd } from "@/components/JsonLd";
import { localBusinessJsonLd } from "@/utils/jsonLd";
import { ExploreDestinations } from "@/components/explore/ExploreDestinations";
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
  const { t: tCommon } = useTranslation("common");
  const { t: tStatic } = useTranslation("static");
  const href = useLocalizedHref();
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
        title: tCommon("toast.contactMessageSent"),
        description: tCommon("toast.contactMessageSentHint"),
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
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="static"
        titleKey="contact.meta.title"
        descriptionKey="contact.meta.description"
      />
      <JsonLd payload={localBusinessJsonLd()} />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 overflow-hidden bg-paper">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <MessageSquare className="h-10 w-10 text-mocha mx-auto mb-4" />
              <h1 className="text-h1 md:text-h1-md lg:text-display-md font-medium tracking-tight">
                {tStatic("contact.heroTitle")}
              </h1>
              <p className="text-body-lg md:text-h3-md text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {tStatic("contact.heroLead")}
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
                    <h2 className="text-h2 md:text-h1-md font-medium mb-6">
                      {tStatic("contact.infoTitle")}
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      {tStatic("contact.infoLead")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Email */}
                    <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Mail className="h-6 w-6 text-mocha flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{tStatic("contact.email")}</h3>
                            <a
                              href="mailto:contact@modest.shops"
                              className="text-primary hover:underline text-caption"
                            >
                              contact@modest.shops
                            </a>
                            <p className="text-caption text-muted-foreground mt-1">
                              {tStatic("contact.emailHint")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Phone */}
                    <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Phone className="h-6 w-6 text-mocha flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{tStatic("contact.phone")}</h3>
                            <a
                              href="tel:+37360123456"
                              className="text-primary hover:underline text-caption"
                            >
                              +373 60 123 456
                            </a>
                            <p className="text-caption text-muted-foreground mt-1">
                              {tStatic("contact.phoneHours")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Address */}
                    <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <MapPin className="h-6 w-6 text-mocha flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{tStatic("contact.address")}</h3>
                            <p className="text-caption text-muted-foreground" style={{ whiteSpace: "pre-line" }}>
                              {tStatic("contact.addressValue")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Instagram */}
                    <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Instagram className="h-6 w-6 text-mocha flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{tStatic("contact.instagram")}</h3>
                            <a
                              href="https://www.instagram.com/modest.shops/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-caption"
                            >
                              @modest.shops
                            </a>
                            <p className="text-caption text-muted-foreground mt-1">
                              {tStatic("contact.instagramFollowers")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Working Hours */}
                    <Card className="border border-primary/10 bg-mocha-soft">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Clock className="h-6 w-6 text-mocha flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">{tStatic("contact.schedule")}</h3>
                            <div className="space-y-1 text-caption text-muted-foreground">
                              <div className="flex justify-between">
                                <span>{tStatic("contact.weekdays")}</span>
                                <span className="font-medium">10:00 - 18:00</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{tStatic("contact.saturday")}</span>
                                <span className="font-medium">10:00 - 16:00</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{tStatic("contact.sunday")}</span>
                                <span className="font-medium">{tStatic("contact.closed")}</span>
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
                      <CardTitle className="text-h2 md:text-h2-md font-medium">
                        {tStatic("contact.formTitle")}
                      </CardTitle>
                      <p className="text-caption text-muted-foreground mt-2">
                        {tStatic("contact.formLead")}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">{tStatic("contact.fieldName")}</Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder={tStatic("contact.fieldNamePlaceholder")}
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">{tStatic("contact.fieldEmail")}</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={tStatic("contact.fieldEmailPlaceholder")}
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">{tStatic("contact.fieldPhone")}</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder={tStatic("contact.fieldPhonePlaceholder")}
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">{tStatic("contact.fieldSubject")}</Label>
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            placeholder={tStatic("contact.fieldSubjectPlaceholder")}
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">{tStatic("contact.fieldMessage")}</Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder={tStatic("contact.fieldMessagePlaceholder")}
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
                              {tStatic("contact.submitSending")}
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              {tStatic("contact.submitButton")}
                            </>
                          )}
                        </Button>

                        <p className="text-caption text-muted-foreground text-center">
                          {tStatic("contact.formDisclaimer")}{" "}
                          <a href={href("/terms")} className="text-primary hover:underline">
                            {tStatic("contact.formDisclaimerTerms")}
                          </a>{" "}
                          {tStatic("contact.formDisclaimerAnd")}{" "}
                          <a href={href("/privacy")} className="text-primary hover:underline">
                            {tStatic("contact.formDisclaimerPrivacy")}
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
                <h2 className="text-h2 md:text-h1-md font-medium mb-4">
                  {tStatic("contact.faqSectionTitle")}
                </h2>
                <p className="text-muted-foreground">
                  {tStatic("contact.faqSectionLead")}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border border-primary/10 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-medium mb-2">{tStatic("contact.faqDelivery")}</h3>
                    <p className="text-caption text-muted-foreground">
                      {tStatic("contact.faqDeliveryBody")}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-primary/10 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-medium mb-2">{tStatic("contact.faqReturns")}</h3>
                    <p className="text-caption text-muted-foreground">
                      {tStatic("contact.faqReturnsBody")}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-primary/10 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-medium mb-2">{tStatic("contact.faqProducts")}</h3>
                    <p className="text-caption text-muted-foreground">
                      {tStatic("contact.faqProductsBody")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 md:pb-24">
          <ExploreDestinations tiles={["brands", "products", "discoverySets"]} />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
