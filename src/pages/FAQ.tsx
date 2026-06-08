import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageMeta } from "@/hooks/usePageMeta";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/utils/jsonLd";
import { ExploreDestinations } from "@/components/explore/ExploreDestinations";
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
} from "lucide-react";

interface FaqItem {
  question: string;
  answer?: string;
  answerIntro?: string;
  answerItems?: string[];
  answerOutro?: string;
  answerNote?: string;
  answerLinkText?: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  about: Building2,
  products: Package,
  orders: ShoppingCart,
  payment: CreditCard,
  shipping: Truck,
  returns: RotateCcw,
  warranty: Shield,
  account: Lock,
  contact: Mail,
};

const FAQ = () => {
  const { t } = useTranslation("static");
  const localizedHref = useLocalizedHref();

  // Top FAQs are emitted as JSON-LD; full list lives in the rendered HTML below.
  const topFaqSections = ['about', 'products', 'orders'] as const;
  const faqQas = topFaqSections.flatMap((sectionKey) => {
    const section = t(`faq.sections.${sectionKey}`, { returnObjects: true }) as FaqSection;
    return section.items
      .filter((item) => typeof item.answer === 'string' && item.answer.length > 0)
      .slice(0, 2)
      .map((item) => ({ q: item.question, a: item.answer as string }));
  });

  const handleAccordionChange = (value: string) => {
    if (value) {
      setTimeout(() => {
        const accordionElement = document.querySelector(`[data-accordion-item="${value}"]`);
        if (accordionElement) {
          const headerOffset = 80;
          const elementPosition = accordionElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  };

  const sectionKeys = ['about', 'products', 'orders', 'payment', 'shipping', 'returns', 'warranty', 'account', 'contact'];

  const renderAnswer = (item: FaqItem, sectionKey: string, itemIndex: number) => {
    if (sectionKey === 'account' && itemIndex === 1) {
      // account[1]: data protection link
      return (
        <div className="space-y-2">
          <p>{item.answer}</p>
          <p className="pt-2">
            <Link to={localizedHref("/privacy")} className="text-primary hover:underline font-medium">
              {item.answerLinkText}
            </Link>
          </p>
        </div>
      );
    }
    if (sectionKey === 'contact' && itemIndex === 0) {
      // contact[0]: how to reach us - static contact info
      return (
        <div className="space-y-3">
          <p>{item.answerIntro}</p>
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
                <a href="tel:+37369269204" className="text-primary hover:underline">
                  +373 69 269 204
                </a>
              </span>
            </div>
          </div>
        </div>
      );
    }
    if (sectionKey === 'warranty' && itemIndex === 0) {
      // warranty[0]: allergy note
      return (
        <div className="space-y-2">
          <p>{item.answer}</p>
          {item.answerNote && (
            <p className="pt-2"><strong>{item.answerNote}</strong></p>
          )}
        </div>
      );
    }
    if (sectionKey === 'shipping' && itemIndex === 1) {
      // shipping[1]: delivery time with items list but no intro
      return (
        <div className="space-y-2">
          {item.answerItems && (
            <ul className="list-disc list-inside space-y-1 ml-4">
              {item.answerItems.map((li, i) => <li key={i}>{li}</li>)}
            </ul>
          )}
          {item.answerOutro && <p className="pt-2">{item.answerOutro}</p>}
        </div>
      );
    }
    if (item.answerIntro || item.answerItems) {
      return (
        <div className="space-y-2">
          {item.answerIntro && <p>{item.answerIntro}</p>}
          {item.answerItems && (
            <ul className="list-disc list-inside space-y-1 ml-4">
              {item.answerItems.map((li, i) => <li key={i}>{li}</li>)}
            </ul>
          )}
          {item.answerOutro && <p className="pt-2">{item.answerOutro}</p>}
        </div>
      );
    }
    return <p>{item.answer}</p>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="static"
        titleKey="faq.meta.title"
        descriptionKey="faq.meta.description"
      />
      <JsonLd payload={faqJsonLd(faqQas)} />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 overflow-hidden bg-paper">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <HelpCircle className="h-10 w-10 text-mocha mx-auto mb-4" />
              <h1 className="text-h1 md:text-h1-md lg:text-display-md font-medium tracking-tight">
                {t("faq.heroTitle")}
              </h1>
              <p className="text-body-lg md:text-h3-md text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t("faq.heroLead")}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {sectionKeys.map((sectionKey) => {
                const section = t(`faq.sections.${sectionKey}`, { returnObjects: true }) as FaqSection;
                const Icon = sectionIcons[sectionKey];
                return (
                  <Card key={sectionKey} className="border border-primary/10">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex items-center space-x-3 mb-6">
                        {Icon && <Icon className="h-5 w-5 text-mocha" />}
                        <h2 className="text-h2 md:text-h2-md font-medium">
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
                          const itemValue = `item-${sectionKey}-${index}`;
                          return (
                            <div key={index} data-accordion-item={itemValue} className="scroll-mt-20">
                              <AccordionItem value={itemValue}>
                                <AccordionTrigger className="text-left font-medium">
                                  {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                  {renderAnswer(item, sectionKey, index)}
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
              <Card className="border-2 border-primary/20 bg-mocha-soft shadow-xl">
                <CardContent className="p-8 md:p-12 text-center">
                  <Sparkles className="h-8 w-8 text-mocha mx-auto mb-6" />
                  <h2 className="text-h2 md:text-h1-md font-medium mb-4">
                    {t("faq.moreQuestionsTitle")}
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    {t("faq.moreQuestionsBody")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to={localizedHref("/contact")}
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {t("faq.contactUs")}
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
                <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                  {t("faq.additionalInfoTitle")}
                </h2>
                <p className="text-muted-foreground">
                  {t("faq.additionalInfoLead")}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to={localizedHref("/terms")}>
                  <Card className="border border-primary/10 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-medium mb-2">{t("faq.termsLink")}</h3>
                      <p className="text-caption text-muted-foreground">
                        {t("faq.termsLinkBody")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to={localizedHref("/privacy")}>
                  <Card className="border border-primary/10 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-medium mb-2">{t("faq.privacyLink")}</h3>
                      <p className="text-caption text-muted-foreground">
                        {t("faq.privacyLinkBody")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to={localizedHref("/contact")}>
                  <Card className="border border-primary/10 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-medium mb-2">{t("faq.contactLink")}</h3>
                      <p className="text-caption text-muted-foreground">
                        {t("faq.contactLinkBody")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
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

export default FAQ;
