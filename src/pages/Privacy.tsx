import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ExploreDestinations } from "@/components/explore/ExploreDestinations";
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
  const { t, i18n } = useTranslation("static");
  const localizedHref = useLocalizedHref();

  const currentDate = new Date().toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'en' ? 'en-GB' : 'ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const userProvidedItems = t("privacy.sections.dataTypes.userProvidedItems", { returnObjects: true }) as string[];
  const autoCollectedItems = t("privacy.sections.dataTypes.autoCollectedItems", { returnObjects: true }) as string[];
  const purposeItems = t("privacy.sections.purposes.items", { returnObjects: true }) as string[];
  const legalBasisItems = t("privacy.sections.legalBasis.items", { returnObjects: true }) as string[];
  const recipientItems = t("privacy.sections.recipients.items", { returnObjects: true }) as string[];
  const retentionItems = t("privacy.sections.retention.items", { returnObjects: true }) as string[];
  const rightsItems = t("privacy.sections.rights.items", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="static"
        titleKey="privacy.meta.title"
        descriptionKey="privacy.meta.description"
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 overflow-hidden bg-paper">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <Shield className="h-10 w-10 text-mocha mx-auto mb-4" />
              <h1 className="text-h1 md:text-h1-md lg:text-display-md font-medium tracking-tight">
                {t("privacy.heroTitle")}
              </h1>
              <p className="text-caption md:text-body text-muted-foreground">
                {t("privacy.lastUpdated", { date: currentDate })}
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
                    {t("privacy.intro")}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    {t("privacy.introConsent")}
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
                    <Building2 className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("privacy.sections.operator.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t("privacy.sections.operator.intro")}</p>
                        <div className="space-y-2 pt-2">
                          <p><strong>{t("privacy.sections.operator.name")}</strong></p>
                          <p><strong>{t("privacy.sections.operator.address")}</strong></p>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <span><strong>Email:</strong> <a href="mailto:contact@modest.shops" className="text-primary hover:underline">contact@modest.shops</a></span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-primary" />
                            <span><strong>Telefon:</strong> <a href="tel:+37369269204" className="text-primary hover:underline">+373 69 269 204</a></span>
                          </div>
                        </div>
                        <p className="pt-2">
                          {t("privacy.sections.operator.outro")}
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
                    <Database className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("privacy.sections.dataTypes.title")}
                      </h2>
                      <div className="space-y-4 text-muted-foreground">
                        <p>{t("privacy.sections.dataTypes.intro")}</p>

                        <div className="bg-muted/30 rounded-lg p-4 mt-4">
                          <p className="font-medium mb-2">{t("privacy.sections.dataTypes.userProvided")}</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            {userProvidedItems.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4">
                          <p className="font-medium mb-2">{t("privacy.sections.dataTypes.autoCollected")}</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            {autoCollectedItems.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Scopurile prelucrarii */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <Target className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("privacy.sections.purposes.title")}
                      </h2>
                      <p className="text-muted-foreground mb-3">
                        {t("privacy.sections.purposes.intro")}
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                        {purposeItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Temeiul legal */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <Scale className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("privacy.sections.legalBasis.title")}
                      </h2>
                      <p className="text-muted-foreground mb-3">
                        {t("privacy.sections.legalBasis.intro")}
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                        {legalBasisItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 5. Destinatarii datelor */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <Users className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("privacy.sections.recipients.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t("privacy.sections.recipients.intro")}</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {recipientItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                        <p className="pt-2 font-medium text-foreground">
                          {t("privacy.sections.recipients.noSale")}
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
                    <Clock className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("privacy.sections.retention.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t("privacy.sections.retention.intro")}</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {retentionItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                        <p className="pt-2">
                          {t("privacy.sections.retention.outro")}
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
                    <Shield className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("privacy.sections.rights.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t("privacy.sections.rights.intro")}</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          {rightsItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                        <p className="pt-2">
                          {t("privacy.sections.rights.contact")}{" "}
                          <a href="mailto:contact@modest.shops" className="text-primary hover:underline font-medium">
                            contact@modest.shops
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
                    <Lock className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("privacy.sections.security.title")}
                      </h2>
                      <p className="text-muted-foreground">
                        {t("privacy.sections.security.body")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 9. Cookie-uri */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <Cookie className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("privacy.sections.cookies.title")}
                      </h2>
                      <div className="space-y-3 text-muted-foreground">
                        <p>{t("privacy.sections.cookies.body1")}</p>
                        <p>{t("privacy.sections.cookies.body2")}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 10. Transferul datelor */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <Globe className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("privacy.sections.transfer.title")}
                      </h2>
                      <p className="text-muted-foreground">
                        {t("privacy.sections.transfer.body")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 11. Modificari ale politicii */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <FileText className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("privacy.sections.changes.title")}
                      </h2>
                      <p className="text-muted-foreground">
                        {t("privacy.sections.changes.body")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 12. Contact */}
              <Card className="border border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4 mb-4">
                    <Mail className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                        {t("privacy.sections.contact.title")}
                      </h2>
                      <p className="text-muted-foreground mb-3">
                        {t("privacy.sections.contact.intro")}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <a href="mailto:contact@modest.shops" className="text-primary hover:underline">
                            contact@modest.shops
                          </a>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <a href="tel:+37369269204" className="text-primary hover:underline">
                            +373 69 269 204
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acceptance Notice */}
              <Card className="border-2 border-primary/20 bg-mocha-soft">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start space-x-4">
                    <CheckCircle2 className="h-5 w-5 text-mocha flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-body md:text-body-lg font-medium">
                        {t("privacy.acceptanceNotice")}
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
                  <h2 className="text-h2 md:text-h2-md font-medium mb-4">
                    {t("privacy.legalDocsTitle")}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {t("privacy.legalDocsLead")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to={localizedHref("/terms")}
                      className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {t("privacy.termsLink")}
                    </Link>
                    <Link
                      to={localizedHref("/contact")}
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {t("privacy.contactLink")}
                    </Link>
                  </div>
                </CardContent>
              </Card>
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

export default Privacy;
