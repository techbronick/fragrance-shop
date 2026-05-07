import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageMeta } from "@/hooks/usePageMeta";
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
  const { t, i18n } = useTranslation("static");
  const localizedHref = useLocalizedHref();

  const currentDate = new Date().toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'en' ? 'en-GB' : 'ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const refusalItems = t("terms.sections.orders.refusalItems", { returnObjects: true }) as string[];
  const paymentItems = t("terms.sections.prices.paymentItems", { returnObjects: true }) as string[];
  const deliveryItems = t("terms.sections.shipping.deliveryItems", { returnObjects: true }) as string[];
  const noReturnItems = t("terms.sections.returns.noReturnItems", { returnObjects: true }) as string[];
  const dataProtectionItems = t("terms.sections.dataProtection.items", { returnObjects: true }) as string[];
  const liabilityItems = t("terms.sections.liability.items", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="static"
        titleKey="terms.meta.title"
        descriptionKey="terms.meta.description"
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 overflow-hidden bg-paper">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <FileText className="h-10 w-10 text-mocha mx-auto mb-4" />
              <h1 className="text-h1 md:text-h1-md lg:text-display-md font-medium tracking-tight">
                {t("terms.heroTitle")}
              </h1>
              <p className="text-caption md:text-body text-muted-foreground">
                {t("terms.lastUpdated", { date: currentDate })}
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
                    {t("terms.intro")}
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

              {/* 1. Informatii generale */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <Building2 className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("terms.sections.general.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t("terms.sections.general.body")}</p>
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <span>Email: <a href="mailto:contact@modest.shops" className="text-primary hover:underline">contact@modest.shops</a></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-primary" />
                            <span>Telefon: <a href="tel:+37360123456" className="text-primary hover:underline">+373 60 123 456</a></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Instagram className="h-4 w-4 text-primary" />
                            <span>Instagram: <a href="https://www.instagram.com/modest.shops/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@modest.shops</a></span>
                          </div>
                        </div>
                        <p className="pt-2">
                          {t("terms.sections.general.outro")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Definitii */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <FileText className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("terms.sections.definitions.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p><strong>{t("terms.sections.definitions.seller")}</strong></p>
                        <p><strong>{t("terms.sections.definitions.client")}</strong></p>
                        <p><strong>{t("terms.sections.definitions.products")}</strong></p>
                        <p><strong>{t("terms.sections.definitions.order")}</strong></p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Produse si autenticitate */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <Shield className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("terms.sections.authenticity.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t("terms.sections.authenticity.body1")}</p>
                        <p>{t("terms.sections.authenticity.body2")}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Plasarea comenzilor */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <ShoppingCart className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("terms.sections.orders.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t("terms.sections.orders.body1")}</p>
                        <p>{t("terms.sections.orders.body2")}</p>
                        <p className="pt-2"><strong>{t("terms.sections.orders.refusalTitle")}</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {refusalItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 5. Preturi si plati */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <CreditCard className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("terms.sections.prices.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t("terms.sections.prices.body1")}</p>
                        <p>{t("terms.sections.prices.body2")}</p>
                        <p className="pt-2"><strong>{t("terms.sections.prices.paymentTitle")}</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {paymentItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                        <p className="pt-2">
                          {t("terms.sections.prices.body3")}
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
                    <Truck className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("terms.sections.shipping.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t("terms.sections.shipping.body1")}</p>
                        <p className="pt-2"><strong>{t("terms.sections.shipping.deliveryTitle")}</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {deliveryItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                        <p className="pt-2">
                          {t("terms.sections.shipping.body2")}
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
                    <RotateCcw className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("terms.sections.returns.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t("terms.sections.returns.body1")}</p>
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-4">
                          <p className="font-medium text-destructive mb-2">{t("terms.sections.returns.noReturnTitle")}</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            {noReturnItems.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <p className="pt-2">
                          {t("terms.sections.returns.body2")}
                        </p>
                        <p>
                          {t("terms.sections.returns.body3")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 8. Garantii si reclamatii */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <AlertTriangle className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("terms.sections.warranty.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t("terms.sections.warranty.body1")}</p>
                        <p className="pt-2">
                          {t("terms.sections.warranty.body2")}{" "}
                          <a href="mailto:contact@modest.shops" className="text-primary hover:underline font-medium">
                            contact@modest.shops
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 9. Drepturi de proprietate intelectuala */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <Copyright className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("terms.sections.ip.title")}
                      </h2>
                      <p className="text-muted-foreground">
                        {t("terms.sections.ip.body")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 10. Protectia datelor personale */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <Lock className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("terms.sections.dataProtection.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p><strong>{t("terms.sections.dataProtection.intro")}</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {dataProtectionItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                        <p className="pt-2">
                          <Link to={localizedHref("/privacy")} className="text-primary hover:underline font-medium">
                            {t("terms.sections.dataProtection.privacyLink")}
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 11. Limitarea raspunderii */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <AlertTriangle className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("terms.sections.liability.title")}
                      </h2>
                      <p className="text-muted-foreground mb-3">
                        {t("terms.sections.liability.intro")}
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                        {liabilityItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 12. Legea aplicabila */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <Scale className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("terms.sections.law.title")}
                      </h2>
                      <p className="text-muted-foreground">
                        {t("terms.sections.law.body")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acceptance Notice */}
              <Card className="border-2 border-primary/20 bg-mocha-soft">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4">
                    <Shield className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-body md:text-body-lg font-medium">
                        {t("terms.acceptanceNotice")}
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
                  <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                    {t("terms.questionsTitle")}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {t("terms.questionsLead")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="mailto:contact@modest.shops"
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {t("terms.sendEmail")}
                    </a>
                    <Link
                      to={localizedHref("/contact")}
                      className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium"
                    >
                      {t("terms.contactPage")}
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
