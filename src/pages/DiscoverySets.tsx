import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageMeta } from "@/hooks/usePageMeta";
import { useDiscoverySetConfigs } from "@/hooks/useDiscoverySets";
import { PredefinedSetsGrid } from "@/components/discovery/PredefinedSetsGrid";
import { SetBuilder } from "@/components/discovery/SetBuilder";
import { RecommendationWizard } from "@/components/discovery/RecommendationWizard";

const DiscoverySets = () => {
  const location = useLocation();
  const path = location.pathname;
  const { t } = useTranslation("discovery");
  const href = useLocalizedHref();

  const view: 'predefined' | 'builder' | 'recommend' =
    path.endsWith('/builder') ? 'builder' :
    path.endsWith('/recommend') ? 'recommend' :
    'predefined';

  const NAV_LINKS = [
    { to: href('/discovery-sets'), match: 'predefined' as const, label: t('tabs.predefined') },
    { to: href('/discovery-sets/builder'), match: 'builder' as const, label: t('tabs.builder') },
    { to: href('/discovery-sets/recommend'), match: 'recommend' as const, label: t('tabs.recommend') },
  ];

  const { data: configs = [], isLoading } = useDiscoverySetConfigs();
  const predefinedSets = configs.filter(c => !c.is_customizable);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <PageMeta
        namespace="discovery"
        titleKey="meta.title"
        descriptionKey="meta.description"
      />
      <Header />

      <main className="flex-1 pb-24 lg:pb-0">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12">
          <nav className="flex flex-wrap gap-6 mb-8">
            {NAV_LINKS.map(l => (
              <Link
                key={l.match}
                to={l.to}
                className={
                  view === l.match
                    ? "text-body text-text-strong font-medium"
                    : "text-body text-text-muted hover:text-text duration-instant ease-default"
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {view === 'predefined' && (
            <>
              <h1 className="text-h1 md:text-h1-md font-normal text-text-strong">
                {t('title')}
              </h1>
              <p className="text-body text-text-muted mt-2 max-w-2xl mb-12">
                {t('subtitle')}
              </p>
              <PredefinedSetsGrid sets={predefinedSets} isLoading={isLoading} />
            </>
          )}

          {view === 'builder' && <SetBuilder />}
          {view === 'recommend' && <RecommendationWizard />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DiscoverySets;
