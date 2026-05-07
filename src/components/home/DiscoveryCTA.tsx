import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";

export function DiscoveryCTA() {
  const navigate = useNavigate();
  const { t } = useTranslation('home');
  const localizedHref = useLocalizedHref();

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mb-16 md:mb-24">
      <div className="bg-mocha-soft rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="aspect-square md:aspect-auto">
          <img
            src="/discovery-cta.webp"
            alt={t('discoveryCta.title')}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-12 md:px-12 md:py-16 text-center md:text-left">
          <h2 className="text-h1 md:text-h1-md font-normal text-text-strong">
            {t('discoveryCta.title')}
          </h2>
          <p className="text-body md:text-body-lg text-text mt-4 max-w-md md:mx-0 mx-auto">
            {t('discoveryCta.body')}
          </p>
          <div className="mt-8 md:self-start self-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(localizedHref('/discovery-sets/builder'))}
            >
              {t('discoveryCta.cta')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
