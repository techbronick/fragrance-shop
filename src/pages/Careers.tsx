import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
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
  const { t } = useTranslation("static");

  const lookingForItems = t("careers.lookingForItems", { returnObjects: true }) as string[];
  const applyItems = t("careers.applyItems", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="static"
        titleKey="careers.meta.title"
        descriptionKey="careers.meta.description"
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden bg-paper">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Briefcase className="h-10 w-10 text-mocha mx-auto mb-6" />
              <h1 className="text-h1 md:text-h1-md lg:text-display-md font-medium tracking-tight">
                {t("careers.heroTitle")}
              </h1>
              <p className="text-body-lg md:text-h3-md text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t("careers.heroLead")}
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
                    <p className="text-muted-foreground leading-relaxed text-body md:text-body-lg">
                      {t("careers.intro1")}
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-body md:text-body-lg">
                      {t("careers.intro2")}
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
                <Heart className="h-8 w-8 text-mocha mx-auto mb-4" />
                <h2 className="text-h1 md:text-h1-md font-medium mb-4">
                  {t("careers.whyTitle")}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border border-primary/10 hover:shadow-lg">
                  <CardContent className="p-6">
                    <Users className="h-6 w-6 text-mocha mb-4" />
                    <h3 className="text-h3 md:text-h3-md font-medium mb-2">
                      {t("careers.why.friendly.title")}
                    </h3>
                    <p className="text-muted-foreground text-caption">
                      {t("careers.why.friendly.body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg">
                  <CardContent className="p-6">
                    <TrendingUp className="h-6 w-6 text-mocha mb-4" />
                    <h3 className="text-h3 md:text-h3-md font-medium mb-2">
                      {t("careers.why.growing.title")}
                    </h3>
                    <p className="text-muted-foreground text-caption">
                      {t("careers.why.growing.body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg">
                  <CardContent className="p-6">
                    <Sparkles className="h-6 w-6 text-mocha mb-4" />
                    <h3 className="text-h3 md:text-h3-md font-medium mb-2">
                      {t("careers.why.premium.title")}
                    </h3>
                    <p className="text-muted-foreground text-caption">
                      {t("careers.why.premium.body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg">
                  <CardContent className="p-6">
                    <Award className="h-6 w-6 text-mocha mb-4" />
                    <h3 className="text-h3 md:text-h3-md font-medium mb-2">
                      {t("careers.why.development.title")}
                    </h3>
                    <p className="text-muted-foreground text-caption">
                      {t("careers.why.development.body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg">
                  <CardContent className="p-6">
                    <Target className="h-6 w-6 text-mocha mb-4" />
                    <h3 className="text-h3 md:text-h3-md font-medium mb-2">
                      {t("careers.why.involvement.title")}
                    </h3>
                    <p className="text-muted-foreground text-caption">
                      {t("careers.why.involvement.body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg">
                  <CardContent className="p-6">
                    <Handshake className="h-6 w-6 text-mocha mb-4" />
                    <h3 className="text-h3 md:text-h3-md font-medium mb-2">
                      {t("careers.why.trust.title")}
                    </h3>
                    <p className="text-muted-foreground text-caption">
                      {t("careers.why.trust.body")}
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
                <Lightbulb className="h-8 w-8 text-mocha mx-auto mb-4" />
                <h2 className="text-h1 md:text-h1-md font-medium mb-4">
                  {t("careers.lookingForTitle")}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t("careers.lookingForLead")}
                </p>
              </div>

              <Card className="border-2 border-primary/10 shadow-lg">
                <CardContent className="p-8 md:p-10">
                  <div className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {t("careers.lookingForIntro")}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {lookingForItems.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-muted-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-muted-foreground italic">
                        {t("careers.lookingForNote")}
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
                <Briefcase className="h-8 w-8 text-mocha mx-auto mb-4" />
                <h2 className="text-h1 md:text-h1-md font-medium mb-4">
                  {t("careers.positionsTitle")}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t("careers.positionsLead")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users className="h-5 w-5 text-mocha" />
                      <h3 className="text-body-lg font-medium">
                        {t("careers.positions.sales.title")}
                      </h3>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      {t("careers.positions.sales.body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Mail className="h-5 w-5 text-mocha" />
                      <h3 className="text-body-lg font-medium">
                        {t("careers.positions.support.title")}
                      </h3>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      {t("careers.positions.support.body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Instagram className="h-5 w-5 text-mocha" />
                      <h3 className="text-body-lg font-medium">
                        {t("careers.positions.social.title")}
                      </h3>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      {t("careers.positions.social.body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Briefcase className="h-5 w-5 text-mocha" />
                      <h3 className="text-body-lg font-medium">
                        {t("careers.positions.logistics.title")}
                      </h3>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      {t("careers.positions.logistics.body")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-primary/20 bg-mocha-soft mt-6">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    <strong>{t("careers.openApplication")}</strong>
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
                <Mail className="h-8 w-8 text-mocha mx-auto mb-4" />
                <h2 className="text-h1 md:text-h1-md font-medium mb-4">
                  {t("careers.applyTitle")}
                </h2>
              </div>

              <Card className="border-2 border-primary/10 shadow-lg">
                <CardContent className="p-8 md:p-10">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-h3 md:text-h3-md font-medium mb-4">
                        {t("careers.applySendTitle")}
                      </h3>
                      <ul className="space-y-3 text-muted-foreground">
                        {applyItems.map((item, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 border-t border-border space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{t("careers.applyEmailLabel")}</p>
                          <a
                            href="mailto:contact@modest.shops?subject=Cariere – [Numele tău]"
                            className="text-primary hover:underline"
                          >
                            contact@modest.shops
                          </a>
                        </div>
                      </div>
                      <p className="text-caption text-muted-foreground ml-8">
                        {t("careers.applyEmailSubjectHint")}
                      </p>
                      <div className="flex items-center space-x-3 pt-2">
                        <Instagram className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{t("careers.applyInstagramLabel")}</p>
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
                  <Handshake className="h-6 w-6 text-mocha mx-auto mb-4" />
                  <h3 className="text-h3 md:text-h3-md font-medium mb-3">
                    {t("careers.equalOpportunityTitle")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("careers.equalOpportunityBody")}
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
              <Card className="border-2 border-primary/20 bg-mocha-soft shadow-xl">
                <CardContent className="p-8 md:p-12 text-center">
                  <Sparkles className="h-8 w-8 text-mocha mx-auto mb-6" />
                  <h2 className="text-h2 md:text-h1-md font-medium mb-4">
                    {t("careers.ctaTitle")}
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    {t("careers.ctaBody")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="mailto:contact@modest.shops?subject=Cariere – Candidatură"
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {t("careers.ctaApply")}
                    </a>
                    <a
                      href="https://www.instagram.com/modest.shops/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium"
                    >
                      <Instagram className="h-4 w-4 mr-2" />
                      {t("careers.ctaInstagram")}
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
