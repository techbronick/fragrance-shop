import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";

const HERO_IMAGE_PATH = "/hero-vanity-3.webp";

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('home');
  const localizedHref = useLocalizedHref();

  return (
    <section className="relative w-full h-[80vh] min-h-[560px] md:h-[85vh] md:min-h-[600px] overflow-hidden bg-text-strong">
      <img
        src={HERO_IMAGE_PATH}
        alt={t('hero.imgAlt')}
        // Mobile: push focal subject toward lower-center so the upper area (where text lives) stays clear of the bottle.
        // Desktop: standard center crop (wide aspect, plenty of room).
        className="absolute inset-0 w-full h-full object-cover object-[65%_75%] md:object-center"
        loading="eager"
        decoding="async"
      />

      {/* Mobile: top-down gradient — content sits in the dark upper zone, bottle remains uncovered below. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/30 to-transparent md:hidden pointer-events-none" />
      {/* Desktop: existing diagonal pulling darkness to bottom-left where the tagline sits. */}
      <div className="absolute inset-0 hidden md:block bg-gradient-to-tr from-black/65 via-black/20 to-transparent pointer-events-none" />

      {/* Mobile: TOP-anchored content. Desktop: BOTTOM-anchored (existing). */}
      <div className="absolute inset-x-0 top-0 px-5 sm:px-6 pt-6 sm:pt-8 md:hidden">
        <div className="max-w-md">
          <h1 className="text-h1 font-light text-paper leading-[1.1] tracking-[-0.01em]">
            {t('hero.tagline')}
          </h1>
          <p className="text-body text-paper/85 mt-3 max-w-xs">
            {t('hero.subhead')}
          </p>
          <div className="flex flex-row flex-wrap justify-center gap-3 mt-6">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(localizedHref('/shop'))}
            >
              {t('hero.ctaShop')}
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="text-paper hover:bg-paper/10 border border-paper/40"
              onClick={() => navigate(localizedHref('/discovery-sets'))}
            >
              {t('hero.ctaDiscovery')}
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden md:block absolute inset-x-0 bottom-0 px-8 lg:px-12 xl:px-16 pb-24">
        <div className="max-w-2xl">
          <h1 className="text-display lg:text-display-md font-light text-paper leading-[1.1] tracking-[-0.01em]">
            {t('hero.tagline')}
          </h1>
          <p className="text-body-lg text-paper/85 mt-4 max-w-md">
            {t('hero.subhead')}
          </p>
          <div className="flex gap-3 mt-8">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(localizedHref('/shop'))}
            >
              {t('hero.ctaShop')}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-paper hover:bg-paper/10"
              onClick={() => navigate(localizedHref('/discovery-sets'))}
            >
              {t('hero.ctaDiscovery')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
