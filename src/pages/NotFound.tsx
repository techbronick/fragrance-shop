import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageMeta } from "@/hooks/usePageMeta";
import { ExploreDestinations } from "@/components/explore/ExploreDestinations";

const NotFound = () => {
  const { t } = useTranslation("static");
  const localizedHref = useLocalizedHref();

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="static"
        titleKey="notFound.meta.title"
        descriptionKey="notFound.meta.description"
      />
      <Header />
      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-display md:text-display-md font-bold text-text-faint mb-4">404</h1>
            <h2 className="text-h2 md:text-h2-md font-semibold mb-4">{t("notFound.title")}</h2>
            <p className="text-text-muted mb-8">
              {t("notFound.body")}
            </p>
            <Link to={localizedHref("/")} className="text-mocha hover:text-mocha-hover underline">
              {t("notFound.backHome")}
            </Link>
          </div>
          <ExploreDestinations tiles={["brands", "products", "discoverySets"]} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
