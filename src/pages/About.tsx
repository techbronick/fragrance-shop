import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import { ExploreDestinations } from "@/components/explore/ExploreDestinations";
import {
  Sparkles,
  Package,
  Globe,
  Target,
  Instagram,
  Award,
  Heart,
  ShoppingBag,
  Star,
  Users
} from "lucide-react";

const About = () => {
  const { t } = useTranslation("static");
  const localizedHref = useLocalizedHref();

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="static"
        titleKey="about.meta.title"
        descriptionKey="about.meta.description"
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden bg-paper">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Sparkles className="h-10 w-10 text-mocha mx-auto mb-6" />
              <h1 className="text-h1 md:text-h1-md lg:text-display-md font-medium tracking-tight">
                {t("about.heroTitle")}
              </h1>
              <p className="text-body-lg md:text-h3-md text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t("about.heroLead")}
              </p>
            </div>
          </div>
        </section>

        {/* Main About Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 border-primary/10 shadow-lg">
                <CardContent className="p-8 md:p-12">
                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <Heart className="h-6 w-6 text-mocha flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h2 className="text-h2 md:text-h1-md font-medium mb-4">
                          {t("about.mainTitle")}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-body md:text-body-lg">
                          {t("about.mainBody")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <Package className="h-8 w-8 text-mocha mx-auto mb-4" />
                <h2 className="text-h1 md:text-h1-md font-medium mb-4">
                  {t("about.offerTitle")}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t("about.offerLead")}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border border-primary/10 hover:shadow-lg">
                  <CardContent className="p-6">
                    <Award className="h-6 w-6 text-mocha mb-4" />
                    <h3 className="text-h3 md:text-h3-md font-medium mb-3">
                      {t("about.offer.niche.title")}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t("about.offer.niche.body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg">
                  <CardContent className="p-6">
                    <Star className="h-6 w-6 text-mocha mb-4" />
                    <h3 className="text-h3 md:text-h3-md font-medium mb-3">
                      {t("about.offer.brands.title")}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t("about.offer.brands.body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 hover:shadow-lg">
                  <CardContent className="p-6">
                    <ShoppingBag className="h-6 w-6 text-mocha mb-4" />
                    <h3 className="text-h3 md:text-h3-md font-medium mb-3">
                      {t("about.offer.order.title")}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t("about.offer.order.body")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Our Presence Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <Globe className="h-8 w-8 text-mocha" />
                  <h2 className="text-h1 md:text-h1-md font-medium">
                    {t("about.presenceTitle")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-body md:text-body-lg"
                    dangerouslySetInnerHTML={{ __html: t("about.presenceBody") }}
                  />
                  <a
                    href="https://www.instagram.com/modest.shops/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <Instagram className="h-5 w-5" />
                    <span>{t("about.followInstagram")}</span>
                  </a>
                </div>
                <div className="relative">
                  <Card className="border-2 border-primary/10 shadow-lg">
                    <CardContent className="p-8 bg-mocha-soft">
                      <div className="text-center space-y-4">
                        <Users className="h-10 w-10 text-mocha mx-auto" />
                        <div className="space-y-2">
                          <div className="text-h1 md:text-h1-md font-medium text-primary">
                            {t("about.followersCount")}
                          </div>
                          <div className="text-muted-foreground font-medium">
                            {t("about.followersLabel")}
                          </div>
                        </div>
                        <p className="text-caption text-muted-foreground pt-4">
                          {t("about.followersCommunity")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Vision Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Target className="h-8 w-8 text-mocha mx-auto mb-4" />
                <h2 className="text-h1 md:text-h1-md font-medium mb-4">
                  {t("about.visionTitle")}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t("about.visionLead")}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border border-primary/10 bg-background/50">
                  <CardContent className="p-6 text-center">
                    <Award className="h-6 w-6 text-mocha mx-auto mb-4" />
                    <h3 className="text-body-lg font-medium mb-3">
                      {t("about.vision.reference.title")}
                    </h3>
                    <p className="text-caption text-muted-foreground leading-relaxed">
                      {t("about.vision.reference.body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 bg-background/50">
                  <CardContent className="p-6 text-center">
                    <Heart className="h-6 w-6 text-mocha mx-auto mb-4" />
                    <h3 className="text-body-lg font-medium mb-3">
                      {t("about.vision.emotion.title")}
                    </h3>
                    <p className="text-caption text-muted-foreground leading-relaxed">
                      {t("about.vision.emotion.body")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-primary/10 bg-background/50">
                  <CardContent className="p-6 text-center">
                    <Star className="h-6 w-6 text-mocha mx-auto mb-4" />
                    <h3 className="text-body-lg font-medium mb-3">
                      {t("about.vision.trust.title")}
                    </h3>
                    <p className="text-caption text-muted-foreground leading-relaxed">
                      {t("about.vision.trust.body")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="border-2 border-primary/20 bg-mocha-soft shadow-xl">
                <CardContent className="p-8 md:p-12 text-center">
                  <div className="space-y-6">
                    <Sparkles className="h-8 w-8 text-mocha mx-auto" />
                    <h2 className="text-h2 md:text-h1-md font-medium">
                      {t("about.ctaTitle")}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
                      {t("about.ctaBody")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <a
                        href={localizedHref("/shop")}
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        {t("about.ctaShop")}
                      </a>
                      <a
                        href={localizedHref("/discovery-sets")}
                        className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-md hover:bg-primary/5 transition-colors font-medium"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        {t("about.ctaDiscovery")}
                      </a>
                    </div>
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

export default About;
